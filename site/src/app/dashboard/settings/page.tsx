import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserProfile } from "@/lib/actions/user"
import { ProfileForm } from "@/components/features/dashboard/ProfileForm"
import { PasswordForm } from "@/components/features/dashboard/PasswordForm"
import { AppearanceForm } from "@/components/features/dashboard/AppearanceForm"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
    const profile = await getUserProfile()

    if (!profile) {
        redirect('/auth/login')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4 mt-4">
                    <ProfileForm
                        initialData={{
                            fullName: profile.fullName,
                            phone: profile.phone,
                        }}
                    />
                </TabsContent>

                <TabsContent value="account" className="space-y-4 mt-4">
                    <PasswordForm email={profile.email} />
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4 mt-4">
                    <AppearanceForm />
                </TabsContent>
            </Tabs>
        </div>
    )
}
