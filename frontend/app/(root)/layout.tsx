import { auth } from "@/auth";
import { HeroHeader } from "@/components/hero5-header";
import { main } from "motion/react-client";

export default async function Layout({children} : Readonly<{children : React.ReactNode}>){
    const session = await auth()

    return(
        <main className="font-work-sans">
            <HeroHeader session={session}/>
            {children}
        </main>
    )
}