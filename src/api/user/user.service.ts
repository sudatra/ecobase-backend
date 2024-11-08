import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/service.response";
import { prisma } from "@/common/utils/db";
import { logger } from "@/server";
import { UserAddressDTO } from "./dto/userAddress.dto";
import { HierarchySlot } from "@/common/types/hierarchy.types";
import { User } from "@/common/types/user.types";

class UserService {
    async fetchUserDetails(email: string): Promise<ServiceResponse<any>> {
        try {
            const userDetails = await prisma.user.findUnique({
                where: { email: email }
            });

            const userAddressDetails = await prisma.address.findFirst({
                where: { userId: userDetails?.id }
            });

            const userTree = await this.fetchUserHierarchyTree(userDetails?.id as string);
            
            return ServiceResponse.success(
                "Successfully fetched User's Details",
                {
                    user: userDetails,
                    address: userAddressDetails ?? {},
                    hierarchyTree: userTree.responseObject
                },
                StatusCodes.ACCEPTED
            );
        }
        catch(error) {
            const errorMessage = `Error fetching User's details: $${(error as Error).message}`;
            logger.error(errorMessage);

            return ServiceResponse.failure(
                "Error Occurred while fetching user's details",
                null,
                StatusCodes.BAD_REQUEST
            )
        }
    }

    async fetchUserHierarchyTree(userId: string): Promise<ServiceResponse<any>> {
        try {
            const userHierarchyTree = await prisma.$queryRaw`
                WITH RECURSIVE UserTree AS (
                    SELECT h."id", h."userId", h."parentId", h."siblings", h."slabNumber"
                    FROM "Hierarchy" AS h
                    WHERE h."userId" = ${userId}

                    UNION ALL

                    SELECT child."id", child."userId", child."parentId", child."siblings", child."slabNumber"
                    FROM "Hierarchy" AS child
                    INNER JOIN UserTree AS parent ON child."parentId" = parent."userId"
                )
                
                SELECT * FROM UserTree
            `;

            return ServiceResponse.success("Successfully fetched User's Tree", userHierarchyTree, StatusCodes.ACCEPTED);
        }
        catch(error) {
            const errorMessage = `Error fetching User's Tree: $${(error as Error).message}`;
            logger.error(errorMessage);

            return ServiceResponse.failure(
                "Error Occurred while fetching User's Subtree",
                null,
                StatusCodes.BAD_REQUEST
            )
        }
    }

    async addUserHierarchy(user: User, userReferrerId?: string): Promise<ServiceResponse<any>> {
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

            const parentSlabInfo = await prisma.slabInfo.findFirst({
                where: { userId: slot.userId }
            })

            if (!parentSlabInfo) {
                return ServiceResponse.failure("Parent SlabInfo not found", null, StatusCodes.BAD_REQUEST);
            }

            const hierarchyLevel = parentSlabInfo.level + 1;

            await prisma.slabInfo.create({
                data: {
                    userId: user.id,
                    slabNumber: 1,
                    repurchaseLevel: hierarchyLevel,
                    level: hierarchyLevel
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
