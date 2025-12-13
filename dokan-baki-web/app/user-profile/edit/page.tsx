import { getCurrentUserId } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { redirect } from "next/navigation";
import EditUserProfileForm from "./edit-form";

export const dynamic = 'force-dynamic';

export default async function EditUserProfilePage() {
    const userId = await getCurrentUserId();
    if (!userId) redirect('/login');

    const user = await getUserById(userId);
    if (!user) redirect('/login');

    return <EditUserProfileForm user={user} />;
}
