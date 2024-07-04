import { LoaderFunction } from 'react-router-dom';

export type RoomLoaderData = {
  roomId: string;
};

export const roomLoader: LoaderFunction = async ({
  params,
}): Promise<RoomLoaderData> => {
  const { roomId } = params;
  console.log(roomId);
  // Assuming you fetch or compute the roomId data here
  return { roomId };
};
