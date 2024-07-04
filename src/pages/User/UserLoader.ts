import { LoaderFunction } from 'react-router-dom';

export type UserLoaderData = {
  userId: string;
};

export const userLoader: LoaderFunction = async ({
  params,
}): Promise<UserLoaderData> => {
  const { userId } = params;
  console.log(userId);
  return {
    userId,
  };
};
