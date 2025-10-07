import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import * as fs from 'fs';

let testEnv: RulesTestEnvironment;

const anthonysId = 'anthony';
const anthonysAuth = { uid: anthonysId };

const julesId = 'jules';
const julesAuth = { uid: julesId };

const circleId = 'loops-dev-team';

describe('Firestore Security Rules', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'loops-mvp-test',
      firestore: {
        rules: fs.readFileSync('firebase.rules', 'utf8'),
        host: 'localhost',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('profiles collection', () => {
    it('should allow a user to read their own profile', async () => {
      const db = testEnv.authenticatedContext(anthonysId).firestore();
      await assertSucceeds(getDoc(doc(db, `profiles/${anthonysId}`)));
    });

    it('should NOT allow a user to read another user profile', async () => {
      const db = testEnv.authenticatedContext(anthonysId).firestore();
      await assertFails(getDoc(doc(db, `profiles/${julesId}`)));
    });

    it('should allow a user to create their own profile', async () => {
      const db = testEnv.authenticatedContext(anthonysId).firestore();
      await assertSucceeds(
        setDoc(doc(db, `profiles/${anthonysId}`), {
          name: 'Anthony',
          email: 'anthony@loops.dev',
        })
      );
    });

    it('should NOT allow a user to create another user profile', async () => {
      const db = testEnv.authenticatedContext(anthonysId).firestore();
      await assertFails(
        setDoc(doc(db, `profiles/${julesId}`), {
          name: 'Jules',
          email: 'jules@loops.dev',
        })
      );
    });
  });

  describe('circles collection', () => {
    it('should allow a user to create a circle where they are the owner', async () => {
      const db = testEnv.authenticatedContext(anthonysId).firestore();
      await assertSucceeds(
        setDoc(doc(db, `circles/${circleId}`), { owner_uid: anthonysId })
      );
    });

    it('should NOT allow a user to create a circle where they are NOT the owner', async () => {
      const db = testEnv.authenticatedContext(anthonysId).firestore();
      await assertFails(
        setDoc(doc(db, `circles/${circleId}`), { owner_uid: julesId })
      );
    });
  });

  describe('sos_events collection', () => {
    beforeEach(async () => {
      // Pre-seed data for tests
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        // Anthony is the owner of the circle
        await setDoc(doc(adminDb, `circles/${circleId}`), {
          owner_uid: anthonysId,
        });
        // Jules is a member of the circle
        await setDoc(doc(adminDb, `circles/${circleId}/members/${julesId}`), {
          status: 'active',
        });
        // An SOS event is created for the circle by Anthony
        await setDoc(doc(adminDb, 'sos_events/sos1'), {
          user_uid: anthonysId,
          circle_id: circleId,
          status: 'active',
        });
      });
    });

    it('should allow a circle member to read an SOS event', async () => {
      const db = testEnv.authenticatedContext(julesId).firestore();
      await assertSucceeds(getDoc(doc(db, 'sos_events/sos1')));
    });

    it('should allow the owner to read their own SOS event', async () => {
      const db = testEnv.authenticatedContext(anthonysId).firestore();
      await assertSucceeds(getDoc(doc(db, 'sos_events/sos1')));
    });

    it('should NOT allow a non-member to read an SOS event', async () => {
      const someRandoId = 'some-rando';
      const db = testEnv.authenticatedContext(someRandoId).firestore();
      await assertFails(getDoc(doc(db, 'sos_events/sos1')));
    });

    it('should allow the owner to resolve an active SOS event', async () => {
      const db = testEnv.authenticatedContext(anthonysId).firestore();
      const sosRef = doc(db, 'sos_events/sos1');
      await assertSucceeds(setDoc(sosRef, { status: 'resolved' }, { merge: true }));
    });

    it('should NOT allow a circle member to resolve an SOS event', async () => {
      const db = testEnv.authenticatedContext(julesId).firestore();
      const sosRef = doc(db, 'sos_events/sos1');
      await assertFails(setDoc(sosRef, { status: 'resolved' }, { merge: true }));
    });
  });
});