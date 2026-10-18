import * as admin from "firebase-admin";

/**
 * Trusted backend utility to provision or elevate an administrator account.
 * This can be run via CLI script or invoked by an authorized root admin.
 *
 * Usage via CLI:
 *   npx ts-node src/admin/setAdminRole.ts admin@codebattle.dev
 */
export async function assignAdminRole(emailOrUid: string): Promise<{ success: boolean; message: string }> {
  const auth = admin.auth();
  const db = admin.firestore();

  let userRecord: admin.auth.UserRecord;

  try {
    if (emailOrUid.includes("@")) {
      userRecord = await auth.getUserByEmail(emailOrUid);
    } else {
      userRecord = await auth.getUser(emailOrUid);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "User not found";
    throw new Error(`Failed to locate user (${emailOrUid}): ${msg}`);
  }

  // 1. Set Firebase Auth Custom User Claims
  await auth.setCustomUserClaims(userRecord.uid, {
    role: "admin",
    adminGrantedAt: new Date().toISOString(),
  });

  // 2. Update Firestore user document
  await db.collection("users").doc(userRecord.uid).set(
    {
      role: "admin",
      accountStatus: "active",
      emailVerified: true,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  console.info(`[Admin Provisioning] Successfully elevated user ${userRecord.email} (${userRecord.uid}) to Administrator.`);
  return {
    success: true,
    message: `User ${userRecord.email} has been provisioned with the Administrator role.`,
  };
}

// Direct CLI execution support
if (require.main === module) {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: ts-node setAdminRole.ts <user-email-or-uid>");
    process.exit(1);
  }
  assignAdminRole(target)
    .then((res) => {
      console.log(res.message);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
