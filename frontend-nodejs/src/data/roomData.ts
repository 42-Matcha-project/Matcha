import { Participant, Room } from "../types/room";

// ダミーの参加者データ
export const dummyParticipants: Participant[] = [
  {
    id: "1",
    name: "ホスト",
    role: "host",
    status: "online",
    joinedAt: "2023-04-01T10:00:00Z",
  },
  {
    id: "2",
    name: "ユーザー1",
    role: "participant",
    status: "online",
    joinedAt: "2023-04-01T10:05:00Z",
  },
  {
    id: "3",
    name: "ユーザー2",
    role: "participant",
    status: "away",
    joinedAt: "2023-04-01T10:10:00Z",
  },
];

// ダミーの部屋データ
export const dummyRooms: Room[] = [
  {
    id: "room1",
    code: "ROOM123",
    name: "プログラミング自習室",
    buildingId: "library",
    hostId: "1",
    createdAt: "2023-04-01T10:00:00Z",
    participantsCount: 3,
    status: "active",
  },
  {
    id: "room2",
    code: "STUDY456",
    name: "数学勉強会",
    buildingId: "school",
    hostId: "4",
    createdAt: "2023-04-01T11:00:00Z",
    participantsCount: 2,
    status: "active",
  },
];

// 参加者のステータス表示に関するヘルパー関数
export const getParticipantStatusColor = (
  status: Participant["status"],
): string => {
  switch (status) {
    case "online":
      return "green";
    case "away":
      return "yellow";
    case "offline":
      return "gray";
    default:
      return "gray";
  }
};
