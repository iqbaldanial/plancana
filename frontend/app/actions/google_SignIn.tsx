'use server'
import { signIn } from "@/auth";

export async function google_SignIn() {
    await signIn("google")
}