// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from "bcryptjs";
import { error } from 'console';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json();

    if(!email || !name || !password){
        return NextResponse.json({error:"missing fields"},{status:400})
    }

    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" }, 
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword
      },
    });

    return NextResponse.json(
      { message: "User created", user }, 
      { status: 201 }
    );
  } catch (error: any) {
  console.error("Registration Error:", error); 
  return NextResponse.json(
    { error: "Internal server error" }, 
    { status: 500 }
  );
}
}