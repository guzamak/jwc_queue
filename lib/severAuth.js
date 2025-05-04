import { getServerSession } from 'next-auth';
import { authOptions } from './app/api/auth/[...nextauth]/route';
import prisma from './lib/prisma';

const serverAuth = async () => {
  const session = await getServerSession(authOptions);
  // console.log(session)
  if (!session?.user?.username) {
    throw new Error('Not User');
  }

  const currentUser = await prisma.user.findUnique({
    where: {
        username: session.user.username,
    },
  });

  if (!currentUser) {
    throw new Error('Not signed in or Session expired');
  }

  return { currentUser };
};

export default serverAuth;