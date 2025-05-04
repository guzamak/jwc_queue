// import prisma from '@/lib/prisma';

// export async function POST(request) {
//   try {
//     const { username, password } = await request.json()
//     // const hashedPassword = bcrypt.hashSync(password, 10)
    
//     const user = await prisma.user.create({
//       data: {
//         username,
//         password,
//       },
//     })
//     return Response.json({ message: 'User created', user })
//   } catch (error) {
//     return Response.json({ error: error })
//   }
// }