import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const consults = await prisma.user.findMany({
      where: {
        role: 'Consult',
        consultIndex: {
          not: null,
        },
      },
      orderBy: {
        consultIndex: 'asc',
      },
      select: {
        username: true,
        consultIndex: true,
        room: true,
      },
    })

    return NextResponse.json({ consults })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'error' }, { status: 500 })
  }
}