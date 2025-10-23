public class PermissionSetAssignmentQueueable implements Queueable {
    private Id userId;
    private String permissionSetApiName;

    /**
     * Constructor
     * @param userId The User ID to assign the permission set to
     * @param permissionSetApiName The API name of the permission set to assign
     */
    public PermissionSetAssignmentQueueable(Id userId, String permissionSetApiName) {
        this.userId = userId;
        this.permissionSetApiName = permissionSetApiName;
    }

    /**
     * Execute method for Queueable interface
     */
    public void execute(QueueableContext context) {
        try {
            // Query for the permission set
            List<PermissionSet> permissionSets = [
                SELECT Id, Name
                FROM PermissionSet
                WHERE Name = :permissionSetApiName
                LIMIT 1
            ];

            if (permissionSets.isEmpty()) {
                System.debug('Permission Set not found: ' + permissionSetApiName);
                return;
            }

            PermissionSet ps = permissionSets[0];

            // Check if permission set is already assigned
            List<PermissionSetAssignment> existingAssignments = [
                SELECT Id
                FROM PermissionSetAssignment
                WHERE PermissionSetId = :ps.Id
                AND AssigneeId = :userId
                LIMIT 1
            ];

            if (!existingAssignments.isEmpty()) {
                System.debug('Permission Set already assigned to user: ' + userId);
                return;
            }

            // Create the permission set assignment
            PermissionSetAssignment psa = new PermissionSetAssignment();
            psa.PermissionSetId = ps.Id;
            psa.AssigneeId = userId;

            insert psa;

            System.debug('Successfully assigned Permission Set: ' + permissionSetApiName + ' to User: ' + userId);

        } catch (Exception e) {
            System.debug('Error assigning permission set: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
        }
    }
}
