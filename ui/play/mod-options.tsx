import { useMemo, useState, useEffect } from "react";
import { TextInput } from "../global/input";
import { createClient } from "@/utils/supabase/client";
import { PrimaryButton } from "../global/buttons";
import { GameData } from "@/lib/types";

export default function ModOptions({
  gameData,
  setGameData,
}: {
  gameData?: GameData;
  setGameData: React.Dispatch<React.SetStateAction<GameData | undefined>>;
}) {
  const [pznAdmin, setIsPZNAdmin] = useState<boolean | null>(null);
  const [tagToAdd, setTagToAdd] = useState<string>("");

  const supabase = useMemo(() => createClient(), []);
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user;
      if (!user) return;
      const res = await fetch(`/api/is-booster?user_id=${user.id}`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ user_id: user.id }),
      });
      const json = await res.json();
      setIsPZNAdmin(res.ok ? json.pznAdmin : false);
    });
  }, [supabase.auth]);

  async function addTag() {
    if (!gameData || !tagToAdd) return;

    const prevTags = gameData.categories ?? [];
    setGameData({
      ...gameData,
      categories: [...prevTags, tagToAdd],
    });

    const res = await fetch("/api/add-tag-to-game", {
      method: "POST",
      body: JSON.stringify({ gameId: gameData._id, tag: tagToAdd }),
    });
    const data = await res.json();

    if (data.error) {
      alert(`Error adding tag: ${data.error}`);
      setGameData((prev) =>
        prev
          ? {
              ...prev,
              categories: prevTags,
            }
          : prev
      );
      return;
    }

    setTagToAdd("");
  }

  async function removeTag() {
    if (!gameData || !tagToAdd) return;

    const prevTags = gameData.categories ?? [];
    setGameData({
      ...gameData,
      categories: prevTags.filter((t) => t !== tagToAdd),
    });

    const res = await fetch("/api/remove-tag-from-game", {
      method: "POST",
      body: JSON.stringify({ gameId: gameData._id, tag: tagToAdd }),
    });
    const data = await res.json();

    if (data.error) {
      alert(`Error removing tag: ${data.error}`);
      setGameData((prev) =>
        prev
          ? {
              ...prev,
              categories: prevTags,
            }
          : prev
      );
      return;
    }

    setTagToAdd("");
  }

  return (
    <>
      {pznAdmin === null ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="flex justify-center">
            <p>
              Categories: {gameData?.categories && gameData.categories.length > 0
                ? gameData.categories.join(", ")
                : "N/A"}
            </p>
          </div>
          <div className="flex">
            <TextInput
              placeholder="Tag to add/remove"
              value={tagToAdd}
              onChange={(content) => setTagToAdd(content)}
            />
            <PrimaryButton text="Add" onClick={addTag} />
            <PrimaryButton
              className="ml-2!"
              text="Remove"
              onClick={removeTag}
            />
          </div>
        </>
      )}
    </>
  );
}
