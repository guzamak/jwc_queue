import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/lib/prisma'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text'},
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials) return null
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        })

        if (
          user &&
          credentials.password == user.password
        ) {
          return {
            id: user.id,
            username: user.username,
            role: user.role,
            consultIndex: user.consultIndex,
          }
        } else {
          throw new Error('Invalid email or password')
        }
      },
    })
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.username = user.username;
        console.log(user)
        token.role = user.role
        if (user.role == "Consult"){
          token.consultIndex = user.consultIndex
        }
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id
        session.user.username = token.username; 
        session.user.role = token.role
        session.user.consultIndex = token.consultIndex
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }