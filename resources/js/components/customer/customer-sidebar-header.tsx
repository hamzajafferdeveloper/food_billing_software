import { Button } from "../ui/button";
import { SidebarTrigger } from "../ui/sidebar";

export function CustomerSidebarHeader() {
    return (
        <header className="shrink-0 items-center w-full gap-2 border-b border-sidebar-border py-2 px-6 transition-[width,height] ease-linear">
            <div className="flex items-center justify-between gap-2">
                <SidebarTrigger />
                <Button className="cursor-pointer">Added Items (3)</Button>
            </div>
        </header>
    );
}
