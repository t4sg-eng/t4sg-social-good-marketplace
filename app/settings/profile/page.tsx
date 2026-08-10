import { getViewer } from "@/lib/roles";
import { redirect } from "next/navigation";
import RoleRequestForm from "./profile-form";

export default async function Settings() {
  const viewer = await getViewer();

  if (!viewer) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-serif text-2xl font-medium text-foreground">
          Role &amp; access
        </h3>
        <p className="annot mt-1">
          Members browse. Ask for the access you need — an admin approves each
          request.
        </p>
      </div>
      <RoleRequestForm
        email={viewer.user.email ?? null}
        role={viewer.role}
        requestedRole={viewer.profile?.requested_role ?? null}
        roleApproved={viewer.profile?.role_approved ?? true}
      />
    </div>
  );
}
