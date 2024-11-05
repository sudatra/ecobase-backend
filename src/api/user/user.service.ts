import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/service.response";
import { prisma } from "@/common/utils/db";
import { logger } from "@/server";
import { UserAddressDTO } from "./dto/userAddress.dto";

interface HierarchySlot {
    id: string;
    userId: string;
    siblings: string[];
    parentId: string;
    level: number;
    createdAt: Date;
}

class UserService {
    async addUserHierarchy(user: any, userReferrerId?: string): Promise<ServiceResponse<any>> {
        try {
            let hierarchyQuery: string = "";
            let availableSlot: HierarchySlot[];

            if(!userReferrerId) {
                hierarchyQuery = `
                    WITH RECURSIVE hierarchy_tree AS (
                        SELECT id, "userId", "parentId", "slabNumber", "siblings", "createdAt", 1 AS LEVEL
                        FROM "Hierarchy"
                        WHERE array_length("siblings", 1) < 3

                        UNION ALL

                        SELECT h.id, h."userId", h."parentId", h."slabNumber", h."siblings", h."createdAt", ht.level + 1
                        FROM "Hierarchy" h
                        INNER JOIN hierarchy_tree ht ON h."parentId" = ht."userId"
                        WHERE array_length(h."siblings", 1) < 3
                    )

                    SELECT *
                    FROM hierarchy_tree
                    ORDER BY "createdAt" ASC
                    LIMIT 1
                `;

                availableSlot = await prisma.$queryRawUnsafe<HierarchySlot[]>(hierarchyQuery);
            }
            else {
                hierarchyQuery = `
                    WITH RECURSIVE hierarchy_tree AS (
                        SELECT id, "userId", "parentId", "slabNumber", "siblings", "createdAt", 1 AS level
                        FROM "Hierarchy"
                        WHERE "userId" = $1
    
                        UNION ALL
    
                        SELECT h.id, h."userId", h."parentId", h."slabNumber", h."siblings", h."createdAt", ht.level + 1
                        FROM "Hierarchy" h
                        INNER JOIN hierarchy_tree ht ON h."parentId" = ht."userId"
                        WHERE array_length(h."siblings", 1) < 3
                    )
    
                    SELECT *
                    FROM hierarchy_tree
                    ORDER BY "createdAt" ASC
                    LIMIT 1
                `;

                availableSlot = await prisma.$queryRawUnsafe<HierarchySlot[]>(hierarchyQuery, userReferrerId);
            }

            if(!availableSlot || availableSlot.length === 0) {
                return ServiceResponse.failure("No Slots Found in Heirarchy", null, StatusCodes.BAD_REQUEST);
            }

            const slot = availableSlot[0];
            const heirarchyLevel = slot.level + 1;

            await prisma.slabInfo.create({
                data: {
                    userId: user.id,
                    slabNumber: 1,
                    repurchaseLevel: 1,
                    level: heirarchyLevel
                }
            });

            await prisma.hierarchy.create({
                data: {
                    userId: user.id,
                    parentId: slot.userId,
                    slabNumber: 1,
                    siblings: [],
                    order: slot.siblings.length + 1
                }
            });

            const updatedSiblings = [...slot.siblings, user.id];

            await prisma.hierarchy.update({
                where: { id: slot.id },
                data: {
                    siblings: updatedSiblings
                }
            })

            return ServiceResponse.success("User Heirarchy added successfully", null, StatusCodes.ACCEPTED);
        }
        catch(error) {
            const errorMessage = `Error adding user heirarchy: $${(error as Error).message}`;
            logger.error(errorMessage);

            return ServiceResponse.failure(
                "Error Occurred while adding user heirarchy",
                null,
                StatusCodes.BAD_REQUEST
            )
        }
    }

    async addUserAddress(userId: string, userAddress: UserAddressDTO): Promise<ServiceResponse<any>> {
        try {
            await prisma.address.create({
                data: {
                    ...userAddress,
                    userId: userId
                }
            });

            return ServiceResponse.success("User's Address successfully added", null, StatusCodes.ACCEPTED);
        }
        catch(error) {
            const errorMessage = "Error adding user address";
            logger.error(errorMessage);

            return ServiceResponse.failure(
                "Error Occurred while adding address for the user",
                null,
                StatusCodes.BAD_REQUEST
            )
        }
    }
}

export const userService = new UserService();