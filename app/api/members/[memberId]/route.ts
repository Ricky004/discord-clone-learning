import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: { memberId: string }}
    ) {
    try {
      const profile = await currentProfile()
      const { searchParams } = new URL(req.url)
      const { role } = await req.json()

      const serverId = searchParams.get("serverId")

      if (!profile) {
        return new NextResponse("Unauthorized", { status: 401 })
      }
      
      if (!serverId) {
        return new NextResponse("Server ID missing", { status: 400 })
      }

      if (!params.memberId ) {
        return new NextResponse("Member ID missing", { status: 400 })
      } 
     
      const server = await db.server.update({
        where: {
            id: serverId,
            profileId: profile.id,
        },
        data: {
            member: {
                update: {
                    where: {
                        id: params.memberId,
                        profileId: {
                            not: profile.id
                        }
                    },
                    data: {
                        role
                    }
                }
            }
        },
        include: {
            member: {
                include: {
                    profile: true
                },
                orderBy: {
                    role: "asc"
                }
            }
        }
      })

      return NextResponse.json(server)
    } catch (err) {
        console.log("[MEMBERS_ID_PATCH]", err)
        return new NextResponse("Internal Error", { status: 500 })
    }
}