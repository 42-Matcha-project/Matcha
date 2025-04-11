import RoomClient from "./RoomClient";

type Props = {
  params: {
    roomCode: string;
  };
};

export default function Page(props: Props) {
  return <RoomClient roomCode={props.params.roomCode} />;
}
