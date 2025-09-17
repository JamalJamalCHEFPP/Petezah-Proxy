import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Card from "../global/card";

export function CustomizationCard() {
  const [bgType, setBgType] = useState("new");
  const supabase = createClient();

  useEffect(() => {
    const stored = localStorage.getItem("backgroundType");
    if (stored === "old" || stored === "new" || stored === "hide") {
      setBgType(stored);
    }
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles_private")
        .select("background_type")
        .eq("id", user.id)
        .single();
      if (data?.background_type) {
        setBgType(data.background_type);
        localStorage.setItem("backgroundType", data.background_type);
      }
    });
  }, [supabase]);

  const handleBgTypeChange = async (newType: string) => {
    setBgType(newType);
    localStorage.setItem("backgroundType", newType);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return window.location.reload();
    await supabase
      .from("profiles_private")
      .update({ background_type: newType })
      .eq("id", user.id);
    window.location.reload();
  };

  return (
    <Card>
      <div className="flex items-center">
        <p>Background:</p>
        <select
          title="bg type"
          value={bgType}
          onChange={(e) => handleBgTypeChange(e.target.value)}
          className="px-2! py-1! ml-2! bg-black border-2 border-white rounded-2xl hover:bg-gray-800 transition-colors duration-500"
        >
          <option className="bg-black" value="new">
            New
          </option>
          <option className="bg-black" value="old">
            Old
          </option>
          <option className="bg-black" value="hide">
            Hidden
          </option>
        </select>
      </div>
    </Card>
  );
}
