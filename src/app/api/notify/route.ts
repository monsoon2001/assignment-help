import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { notifyRequestActivity, notifyOrderActivity } from "@/lib/notify.server";

export const dynamic = "force-dynamic";

/**
 * Fan-out endpoint for activities that originate in the browser (a student
 * submitting a request, a helper sending a proposal, a delivery or revision).
 * The client calls this once after the mutation succeeds; the server re-reads
 * the authoritative row, checks the caller is a party, then emails the student,
 * the helper and all admins and tops up the admins' in-app bell.
 *
 * Body: { event: NotifyEvent, id: string } where id is the created/changed row.
 */
type NotifyEvent =
  | "request.created"
  | "proposal.created"
  | "proposal.declined"
  | "order.delivered"
  | "order.revision_requested"
  | "order.completed";

export async function POST(request: Request) {
  let event: string | undefined;
  let id: string | undefined;
  try {
    const body = await request.json();
    event = body?.event;
    id = body?.id;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!event || typeof id !== "string" || id.length === 0) {
    return NextResponse.json({ error: "Missing event or id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  switch (event as NotifyEvent) {
    case "request.created": {
      const { data } = await adminClient
        .from("requests")
        .select("id, student_id, title")
        .eq("id", id)
        .maybeSingle();
      if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (data.student_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      await notifyRequestActivity(id, ({ title }) => ({
        type: "request",
        message: `A new request was submitted: ${title}`,
        link: `/helper/requests/${id}`,
        emailSubject: `New request: ${title}`,
        emailBody:
          "A student just submitted a new help request. Sign in to review the brief and send a proposal.",
        emailLinkLabel: "Review the request",
        audience: ["student", "helper", "admin"],
        inAppRoles: ["admin"],
        actorId: user.id,
      }));
      break;
    }
    case "proposal.created": {
      const { data } = await adminClient
        .from("proposals")
        .select("helper_id, request_id")
        .eq("id", id)
        .maybeSingle();
      if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (data.helper_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      await notifyRequestActivity(data.request_id, ({ title }) => ({
        type: "proposal",
        message: `A helper sent a proposal for "${title}".`,
        link: `/requests`,
        emailSubject: "A helper sent you a proposal",
        emailBody: `A helper has responded to your request "${title}" with a proposal. Review it and accept to move forward.`,
        emailLinkLabel: "Review the proposal",
        audience: ["student", "helper", "admin"],
        inAppRoles: ["admin"],
        actorId: user.id,
      }));
      break;
    }
    case "proposal.declined": {
      const { data } = await adminClient
        .from("proposals")
        .select("helper_id, request_id, request:requests(student_id, title)")
        .eq("id", id)
        .maybeSingle();
      if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const req = Array.isArray(data.request) ? data.request[0] : data.request;
      const reqRow = req as { student_id?: string; title?: string } | null;
      if (reqRow?.student_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      await notifyRequestActivity(data.request_id, ({ title }) => ({
        type: "proposal",
        message: `A proposal for "${title}" was declined.`,
        link: `/helper/requests/${data.request_id}`,
        emailSubject: "A proposal was declined",
        emailBody: `Your proposal for "${title}" was declined by the student. Keep an eye out for other requests.`,
        emailLinkLabel: "Browse requests",
        audience: ["student", "helper", "admin"],
        inAppRoles: ["helper", "admin"],
        actorId: user.id,
      }));
      break;
    }
    case "order.delivered":
    case "order.revision_requested":
    case "order.completed": {
      const { data } = await adminClient
        .from("orders")
        .select("student_id, helper_id")
        .eq("id", id)
        .maybeSingle();
      if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const isStudent = data.student_id === user.id;
      const isHelper = data.helper_id === user.id;
      if (!isStudent && !isHelper) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (event === "order.delivered" && !isHelper) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if ((event === "order.revision_requested" || event === "order.completed") && !isStudent) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await notifyOrderActivity(id, () => {
        if (event === "order.delivered") {
          return {
            type: "delivery",
            message: "A helper delivered work for your order.",
            link: `/orders/${id}`,
            emailSubject: "Work delivered — review it now",
            emailBody:
              "A helper delivered work for your order. Review it and either accept the delivery or request a revision.",
            emailLinkLabel: "Review the delivery",
            audience: ["student", "helper", "admin"],
            inAppRoles: ["admin"],
            actorId: user.id,
          };
        }
        if (event === "order.revision_requested") {
          return {
            type: "revision",
            message: "A revision was requested for an order.",
            link: `/orders/${id}`,
            emailSubject: "A revision was requested",
            emailBody:
              "The student requested a revision. Review the note and resubmit when ready.",
            emailLinkLabel: "Open the order",
            audience: ["student", "helper", "admin"],
            inAppRoles: ["admin"],
            actorId: user.id,
          };
        }
        return {
          type: "completed",
          message: "An order was completed.",
          link: `/orders/${id}`,
          emailSubject: "Your order is complete",
          emailBody:
            "This order has been marked complete. Thanks for using Acadivo — the receipt is available in your portal.",
          emailLinkLabel: "Open the order",
          audience: ["student", "helper", "admin"],
          inAppRoles: ["admin"],
          actorId: user.id,
        };
      });
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown event" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
