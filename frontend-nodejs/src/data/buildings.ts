import { Building } from "../types/settlement";

// 建物データ
export const buildings: Building[] = [
  {
    id: "house",
    name: "マイハウス",
    level: 1,
    isUnlocked: true,
    requiredLevel: 1,
    price: 0,
    position: { x: 50, y: 20 },
    image: "/images/house.png",
    description:
      "あなたの拠点となるマイハウスです。ここから様々な自習活動を始めることができます。レベルアップすると設備が充実していきます。",
  },
  {
    id: "library",
    name: "図書館",
    level: 3,
    isUnlocked: true,
    requiredLevel: 3,
    price: 100,
    position: { x: 20, y: 15 },
    image: "/placeholder.svg?height=200&width=200",
    description:
      "静かな環境で集中して勉強できる図書館です。読書や資料調査に最適な場所で、知識を深めることができます。",
  },
  {
    id: "school",
    name: "小学校",
    level: 5,
    isUnlocked: false,
    requiredLevel: 5,
    price: 250,
    position: { x: 80, y: 20 },
    image: "/placeholder.svg?height=200&width=200",
    description:
      "基礎学習に最適な小学校です。グループでの学習や基本的なスキルの習得に役立ちます。楽しく学べる環境が整っています。",
  },
  {
    id: "university",
    name: "大学",
    level: 10,
    isUnlocked: false,
    requiredLevel: 10,
    price: 500,
    position: { x: 25, y: 40 },
    image: "/placeholder.svg?height=200&width=200",
    description:
      "高度な学習ができる大学です。専門的な知識やスキルを身につけるための施設が充実しています。研究活動も行えます。",
  },
  {
    id: "lab",
    name: "研究所",
    level: 15,
    isUnlocked: false,
    requiredLevel: 15,
    price: 750,
    position: { x: 75, y: 50 },
    image: "/images/research_institute.png",
    description:
      "最先端の研究ができる研究所です。高度な設備と静かな環境で、最も集中して学習に取り組むことができます。",
  },
  {
    id: "cafe",
    name: "カフェ",
    level: 7,
    isUnlocked: false,
    requiredLevel: 7,
    price: 300,
    position: { x: 40, y: 65 },
    image: "/images/cafe.png",
    description:
      "リラックスした雰囲気で学習できるカフェです。軽食を楽しみながら、気軽に勉強や読書ができます。交流の場としても活用できます。",
  },
];
