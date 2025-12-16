import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, User, Calendar, Shield, Globe, Clock, CheckCircle } from "lucide-react";
import Loading from "../../Components/auth0components/Loading.jsx";

export const ProfileComponent = () => {
  const { user } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header Card */}
        <Card className="mb-6 shadow-lg border-0 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              <div className="relative">
                <Avatar className="h-40 w-40 border-4 border-background shadow-lg">
                  <AvatarImage src={user.picture} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-accent rounded-full p-2 border-4 border-background shadow">
                  <Globe className="h-4 w-4 text-accent-foreground" />
                </div>
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl font-bold mb-4 text-foreground">{user.name}</h1>
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <Mail className="h-5 w-5 text-muted-foreground opacity-70" />
                  <span className="text-lg text-muted-foreground">{user.email}</span>
                </div>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <Badge className="px-4 py-2 text-sm font-semibold rounded-full bg-muted text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    Premium User
                  </Badge>
                  <Badge className="px-4 py-2 text-sm font-semibold rounded-full bg-accent text-accent-foreground">
                    <Shield className="h-4 w-4 mr-2" />
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {/* Account Details Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl font-bold">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium text-muted-foreground">User ID</span>
                <span className="text-sm text-foreground truncate max-w-[120px]" title={user.sub}>
                  {user.sub?.split("|").pop() || user.sub}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium text-muted-foreground">Email Status</span>
                <Badge
                  className={`px-3 py-1 rounded-full ${
                    user.email_verified
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {user.email_verified ? "Verified" : "Pending"}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-medium text-muted-foreground">Provider</span>
                <Badge className="px-3 py-1 rounded-full bg-muted text-muted-foreground">
                  {user.identities?.[0]?.provider || "Auth0"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-xl font-bold">Activity Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium text-muted-foreground">Member Since</span>
                <span className="font-semibold text-foreground">
                  {formatDate(user.created_at || user.updated_at)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium text-muted-foreground">Last Active</span>
                <span className="font-semibold text-foreground">{formatDateShort(user.updated_at)}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-medium text-muted-foreground">Status</span>
                <Badge className="px-3 py-1 rounded-full bg-accent text-accent-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Security Info Card */}
          <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl font-bold">Security Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium text-muted-foreground">Auth Provider</span>
                <Badge className="px-3 py-1 rounded-full bg-muted text-muted-foreground">Auth0</Badge>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium text-muted-foreground">Security Level</span>
                <Badge className="px-3 py-1 rounded-full bg-accent text-accent-foreground">High</Badge>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-medium text-muted-foreground">2FA Status</span>
                <Badge className="px-3 py-1 rounded-full bg-muted text-muted-foreground">Optional</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message Card */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-70" />
              <h3 className="text-2xl font-bold mb-4 text-foreground">Welcome to Your Dashboard</h3>
            </div>
            <p className="text-lg mb-6 text-muted-foreground opacity-80">
              Your account is securely protected with enterprise-grade security through Auth0. Manage your
              preferences, view your activity, and stay connected with our platform.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Badge className="px-4 py-2 text-sm font-semibold rounded-full bg-muted text-muted-foreground">
                <Shield className="h-4 w-4 mr-2" />
                Enterprise Security
              </Badge>
              <Badge className="px-4 py-2 text-sm font-semibold rounded-full bg-accent text-accent-foreground">
                <Globe className="h-4 w-4 mr-2" />
                Global Access
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default withAuthenticationRequired(ProfileComponent, {
  onRedirecting: () => <Loading />,
});
