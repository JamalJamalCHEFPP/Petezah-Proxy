import { ObjectId } from "mongodb";

export interface SeeMoreProps {
  text: string;
  maxLength: number;
  className: string;
}

export interface Tab {
  title: string;
  url: string;
  faviconUrl?: string;
}

export interface GameData {
  _id: string | ObjectId;
  label: string;
  url: string;
  imageUrl: string;
  categories: string[];
  stars?: { userId: string; rating: number }[];
}
