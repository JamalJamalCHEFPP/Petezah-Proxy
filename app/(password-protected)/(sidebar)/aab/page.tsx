"use client";

import CenteredDivPage from "@/ui/global/centered-div-page";
import { setLocalStorage } from "@/ui/settings-manager";

export default function Page() {
  setLocalStorage("autoAboutBlank", "true");
  return (
    <CenteredDivPage className="p-15!">
      <h1 className="text-5xl text-center">Congratulations!</h1>
      <br />
      <h2 className="text-2xl text-center text-gray-500">
        Our site should no longer be blocked. You can still acess it through
        your original link.
      </h2>
    </CenteredDivPage>
  );
}
