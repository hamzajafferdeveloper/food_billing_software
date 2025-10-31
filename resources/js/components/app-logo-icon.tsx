import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";

export default function AppLogoIcon() {
    const siteLogo = usePage<SharedData>().props.site_logo || '/red-pepper-resturant.png';
    return (
        <img src={siteLogo} />
    );
}
