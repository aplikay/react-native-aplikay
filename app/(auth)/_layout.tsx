import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/expo";

export default function AuthLayout() {
    const { isSignedIn, isLoaded } = useAuth();

    // Wait until Clerk has finished loading before deciding anything
    if (!isLoaded) return null;

    // Already signed in, so skip the sign-in and sign-up screens
    if (isSignedIn) return <Redirect href="/(tabs)" />;

    return <Stack screenOptions={{ headerShown: false }} />;
}