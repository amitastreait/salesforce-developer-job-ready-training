/**
 * @description Service class for managing Groups and GroupMembers in Salesforce
 * @author - Amit Singh
 * @date 27-08-2025
 */

/*
	// 1. Create single group with members
    List<Id> userIds = new List<Id>{UserInfo.getUserId()};
    Group salesGroup = GroupManagementService.createGroupWithMembers(
        'Sales Team', 
        'Regular', 
        userIds
    );
    
    // 2. Create multiple groups at once
    List<GroupManagementService.GroupData> groups = new List<GroupManagementService.GroupData>();
    groups.add(new GroupManagementService.GroupData('Team A', teamAUserIds));
    groups.add(new GroupManagementService.GroupData('Team B', teamBUserIds));
    List<Group> createdGroups = GroupManagementService.createMultipleGroupsWithMembers(groups);
    
    // 3. Create a queue for case assignment
    Group supportQueue = GroupManagementService.createQueueWithMembers(
        'Support Queue',
        'support@company.com',
        supportUserIds,
        new List<String>{'Case', 'Lead'}
    );
    
    // 4. Add members to existing group
    GroupManagementService.addMembersToGroup(existingGroupId, newMemberIds);
 
 */ 
public without sharing class GroupManagementService {
    
    public static final String GROUP_TYPE_REGULAR = 'Regular';
    public static final String GROUP_TYPE_ROLE = 'Role';
    public static final String GROUP_TYPE_ROLE_AND_SUBORDINATES = 'RoleAndSubordinates';
    public static final String GROUP_TYPE_TERRITORY = 'Territory';
    public static final String GROUP_TYPE_QUEUE = 'Queue';
    
    /**
     * @description Creates a single group with members
     * @param groupName Name of the group
     * @param groupType Type of group (Regular, Role, etc.)
     * @param userIds List of User IDs to add as members
     * @return Created Group record
     */
    public static Group createGroupWithMembers(String groupName, String groupType, List<Id> userIds) {
        // Create the group
        Group newGroup = new Group(
            Name = groupName,
            Type = groupType,
            DoesSendEmailToMembers = false,
            DoesIncludeBosses = false
        );
        
        try {
            insert newGroup;
            
            // Create group members if userIds provided
            if (userIds != null && !userIds.isEmpty()) {
                addMembersToGroup(newGroup.Id, userIds);
            }
            
            return newGroup;
            
        } catch (Exception e) {
            throw new GroupManagementException('Failed to create group: ' + e.getMessage());
        }
    }
    
    /**
     * @description Creates multiple groups with their respective members
     * @param groupData List of GroupData objects containing group and member information
     * @return List of created Groups
     */
    public static List<Group> createMultipleGroupsWithMembers(List<GroupData> groupDataList) {
        if (groupDataList == null || groupDataList.isEmpty()) {
            return new List<Group>();
        }
        
        List<Group> groupsToInsert = new List<Group>();
        
        // Prepare groups for insertion
        for (GroupData data : groupDataList) {
            Group newGroup = new Group(
                Name = data.groupName,
                Type = data.groupType != null ? data.groupType : GROUP_TYPE_REGULAR,
                DoesSendEmailToMembers = data.sendEmailToMembers != null ? data.sendEmailToMembers : false,
                DoesIncludeBosses = data.includeBosses != null ? data.includeBosses : false
            );
            groupsToInsert.add(newGroup);
        }
        
        try {
            // Insert all groups
            insert groupsToInsert;
            
            // Create all group members
            List<GroupMember> allGroupMembers = new List<GroupMember>();
            
            for (Integer i = 0; i < groupsToInsert.size(); i++) {
                GroupData data = groupDataList[i];
                Group createdGroup = groupsToInsert[i];
                
                if (data.memberIds != null && !data.memberIds.isEmpty()) {
                    for (Id memberId : data.memberIds) {
                        GroupMember member = new GroupMember(
                            GroupId = createdGroup.Id,
                            UserOrGroupId = memberId
                        );
                        allGroupMembers.add(member);
                    }
                }
            }
            
            // Insert all group members
            if (!allGroupMembers.isEmpty()) {
                insert allGroupMembers;
            }
            
            return groupsToInsert;
            
        } catch (Exception e) {
            throw new GroupManagementException('Failed to create multiple groups: ' + e.getMessage());
        }
    }
    
    /**
     * @description Adds members to an existing group
     * @param groupId ID of the group
     * @param memberIds List of User or Group IDs to add as members
     */
    public static void addMembersToGroup(Id groupId, List<Id> memberIds) {
        if (memberIds == null || memberIds.isEmpty()) {
            return;
        }
        
        List<GroupMember> groupMembers = new List<GroupMember>();
        
        for (Id memberId : memberIds) {
            GroupMember member = new GroupMember(
                GroupId = groupId,
                UserOrGroupId = memberId
            );
            groupMembers.add(member);
        }
        
        try {
            insert groupMembers;
        } catch (Exception e) {
            throw new GroupManagementException('Failed to add members to group: ' + e.getMessage());
        }
    }
    
    /**
     * @description Creates a public group with users and nested groups
     * @param groupName Name of the group
     * @param userIds List of User IDs
     * @param nestedGroupIds List of Group IDs to include as members
     * @return Created Group record with all members
     */
    public static Group createPublicGroupWithMixedMembers(String groupName, List<Id> userIds, List<Id> nestedGroupIds) {
        Group newGroup = new Group(
            Name = groupName,
            Type = GROUP_TYPE_REGULAR,
            DoesSendEmailToMembers = true,
            DoesIncludeBosses = false
        );
        
        try {
            insert newGroup;
            
            List<GroupMember> allMembers = new List<GroupMember>();
            
            // Add users as members
            if (userIds != null && !userIds.isEmpty()) {
                for (Id userId : userIds) {
                    allMembers.add(new GroupMember(
                        GroupId = newGroup.Id,
                        UserOrGroupId = userId
                    ));
                }
            }
            
            // Add groups as members (nested groups)
            if (nestedGroupIds != null && !nestedGroupIds.isEmpty()) {
                for (Id nestedGroupId : nestedGroupIds) {
                    allMembers.add(new GroupMember(
                        GroupId = newGroup.Id,
                        UserOrGroupId = nestedGroupId
                    ));
                }
            }
            
            if (!allMembers.isEmpty()) {
                insert allMembers;
            }
            
            return newGroup;
            
        } catch (Exception e) {
            throw new GroupManagementException('Failed to create public group with mixed members: ' + e.getMessage());
        }
    }
    
    /**
     * @description Creates a queue (special type of group) with members
     * @param queueName Name of the queue
     * @param queueEmail Email for the queue
     * @param memberIds List of User IDs to add to queue
     * @param objectTypes List of object types this queue can own
     * @return Created Group (Queue) record
     */
    public static Group createQueueWithMembers(String queueName, String queueEmail, List<Id> memberIds, List<String> objectTypes) {
        Group queueGroup = new Group(
            Name = queueName,
            Type = GROUP_TYPE_QUEUE,
            Email = queueEmail,
            DoesSendEmailToMembers = true,
            DoesIncludeBosses = false
        );
        
        try {
            insert queueGroup;
            
            // Add members to queue
            if (memberIds != null && !memberIds.isEmpty()) {
                addMembersToGroup(queueGroup.Id, memberIds);
            }
            
            // Add object types to queue (QueueSobject records)
            if (objectTypes != null && !objectTypes.isEmpty()) {
                List<QueueSobject> queueObjects = new List<QueueSobject>();
                for (String objectType : objectTypes) {
                    queueObjects.add(new QueueSobject(
                        QueueId = queueGroup.Id,
                        SobjectType = objectType
                    ));
                }
                insert queueObjects;
            }
            
            return queueGroup;
            
        } catch (Exception e) {
            throw new GroupManagementException('Failed to create queue: ' + e.getMessage());
        }
    }
    
    /**
     * @description Removes members from a group
     * @param groupId ID of the group
     * @param memberIds List of member IDs to remove
     */
    public static void removeMembersFromGroup(Id groupId, List<Id> memberIds) {
        if (memberIds == null || memberIds.isEmpty()) {
            return;
        }
        
        List<GroupMember> membersToDelete = [
            SELECT Id FROM GroupMember 
            WHERE GroupId = :groupId AND UserOrGroupId IN :memberIds
        ];
        
        if (!membersToDelete.isEmpty()) {
            try {
                delete membersToDelete;
            } catch (Exception e) {
                throw new GroupManagementException('Failed to remove members from group: ' + e.getMessage());
            }
        }
    }
    
    /**
     * @description Gets all members of a group
     * @param groupId ID of the group
     * @return List of GroupMember records with User/Group details
     */
    public static List<GroupMember> getGroupMembers(Id groupId) {
        return [
            SELECT Id, GroupId, UserOrGroupId, UserOrGroup.Name 
            FROM GroupMember 
            WHERE GroupId = :groupId
        ];
    }
    
    /**
     * @description Checks if a user is member of a group
     * @param groupId ID of the group
     * @param userId ID of the user
     * @return True if user is a member, false otherwise
     */
    public static Boolean isUserMemberOfGroup(Id groupId, Id userId) {
        List<GroupMember> members = [
            SELECT Id FROM GroupMember 
            WHERE GroupId = :groupId AND UserOrGroupId = :userId 
            LIMIT 1
        ];
        return !members.isEmpty();
    }
    
    /**
     * @description Deletes a group and all its members
     * @param groupId ID of the group to delete
     */
    public static void deleteGroupAndMembers(Id groupId) {
        try {
            // Delete group (members will be automatically deleted due to master-detail relationship)
            delete new Group(Id = groupId);
        } catch (Exception e) {
            throw new GroupManagementException('Failed to delete group: ' + e.getMessage());
        }
    }
    
    // Inner class for group data structure
    public class GroupData {
        public String groupName;
        public String groupType;
        public List<Id> memberIds;
        public Boolean sendEmailToMembers;
        public Boolean includeBosses;
        
        public GroupData(String name, String type, List<Id> members) {
            this.groupName = name;
            this.groupType = type;
            this.memberIds = members;
            this.sendEmailToMembers = false;
            this.includeBosses = false;
        }
        
        public GroupData(String name, List<Id> members) {
            this(name, GROUP_TYPE_REGULAR, members);
        }
    }
    
    // Custom exception class
    public class GroupManagementException extends Exception {}
}

/**
 * QUICK USAGE PATTERNS:
 */

// 1. Simple group creation
// List<Id> userIds = new List<Id>{user1.Id, user2.Id, user3.Id};
// Group myGroup = GroupManagementService.createGroupWithMembers('My Team', 'Regular', userIds);

// 2. Create multiple groups at once
// List<GroupManagementService.GroupData> groups = new List<GroupManagementService.GroupData>();
// groups.add(new GroupManagementService.GroupData('Team A', teamAUserIds));
// groups.add(new GroupManagementService.GroupData('Team B', teamBUserIds));
// List<Group> createdGroups = GroupManagementService.createMultipleGroupsWithMembers(groups);

// 3. Create a queue for object assignment
// Group supportQueue = GroupManagementService.createQueueWithMembers(
//     'Support Queue', 'support@company.com', supportUserIds, new List<String>{'Case', 'Lead'}
// );

// 4. Add members to existing group
// GroupManagementService.addMembersToGroup(existingGroupId, newMemberIds);

// 5. Check group membership
// Boolean isMember = GroupManagementService.isUserMemberOfGroup(groupId, userId);

// 6. Get all group members
// List<GroupMember> members = GroupManagementService.getGroupMembers(groupId);