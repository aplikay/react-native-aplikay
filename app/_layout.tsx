import {SplashScreen, Stack, useSegments } from "expo-router";
import "@/global.css";
import {useEffect, useRef} from "react";
import {useFonts} from "expo-font";
import { ClerkProvider, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { posthog } from "@/lib/posthog";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
    throw new Error("Add your Clerk Publishable Key to the .env file");
}

function PostHogScreenTracking() {
    const posthog = usePostHog();
    const segments = useSegments();
    const screenName = segments.join('/') || 'index';

    useEffect(() => {
        posthog.screen(screenName);
    }, [posthog, screenName]);

    return null;
}

function PostHogIdentity() {
    const posthog = usePostHog();
    const { isLoaded, user } = useUser();
    const identifiedUserId = useRef<string | null>(null);

    useEffect(() => {
        if (!isLoaded) return;

        if (!user) {
            if (identifiedUserId.current) {
                posthog.reset();
                identifiedUserId.current = null;
            }
            return;
        }

        if (identifiedUserId.current === user.id) return;

        if (identifiedUserId.current) {
            posthog.reset();
        }

        posthog.identify(user.id, {
            $set: {
                ...(user.primaryEmailAddress?.emailAddress && {
                    email: user.primaryEmailAddress.emailAddress,
                }),
                ...(user.fullName && { name: user.fullName }),
            },
        });
        identifiedUserId.current = user.id;
    }, [isLoaded, posthog, user]);

    return null;
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
        'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
        'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
        'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
        'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
        'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf')
    })

    useEffect(() => {
        if(fontsLoaded) {
            SplashScreen.hideAsync()
        }
    }, [fontsLoaded])

    if (!fontsLoaded) return null;

    return (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            {posthog ? (
                <PostHogProvider client={posthog}>
                    <PostHogScreenTracking />
                    <PostHogIdentity />
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="(auth)" />
                    </Stack>
                </PostHogProvider>
            ) : (
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(auth)" />
                </Stack>
            )}
        </ClerkProvider>
    );
}