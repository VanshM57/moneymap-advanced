import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import Loader from "../components/Loader/Loader";
import CreateGroupModal from "../components/Modals/CreateGroup";
import JoinGroupModal from "../components/Modals/JoinGroup";
import GroupCard from "../components/Splitwise/GroupCard";

const Splitwise = () => {
  const [user] = useAuthState(auth);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateGroupModalVisible, setIsCreateGroupModalVisible] = useState(false);
  const [isJoinGroupModalVisible, setIsJoinGroupModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      fetchUserGroups();
    }
  }, [user, navigate]);

  const fetchUserGroups = async () => {
    setLoading(true);
    try {
      if (!user || !user.uid) {
        console.error("User not available");
        setGroups([]);
        setLoading(false);
        return;
      }

      try {
        // Try to fetch with array-contains query (requires index)
        const q = query(
          collection(db, "splitwise_groups"),
          where("members", "array-contains", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const groupsArray = querySnapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));
        setGroups(groupsArray);
      } catch (indexError) {
        console.warn("Index not available, fetching all groups and filtering client-side:", indexError.message);
        
        // Fallback: fetch all groups and filter client-side
        const allGroupsSnapshot = await getDocs(collection(db, "splitwise_groups"));
        const groupsArray = allGroupsSnapshot.docs
          .filter(docSnapshot => {
            const groupData = docSnapshot.data();
            return groupData.members && groupData.members.includes(user.uid);
          })
          .map((docSnapshot) => ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }));
        setGroups(groupsArray);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      // Don't show error toast on first load, just set empty groups
      if (groups.length > 0) {
        toast.error("Failed to fetch groups");
      }
      setGroups([]);
    }
    setLoading(false);
  };

  const handleCreateGroup = async (values) => {
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    try {
      const groupData = {
        name: values.name,
        description: values.description || "",
        createdBy: user.uid,
        createdAt: new Date(),
        members: [user.uid],
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      };

      await addDoc(collection(db, "splitwise_groups"), groupData);
      toast.success("Group created successfully!");
      fetchUserGroups();
      setIsCreateGroupModalVisible(false);
      return true;
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
      return false;
    }
  };

  const handleJoinGroup = async (inviteCode) => {
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    try {
      const q = query(
        collection(db, "splitwise_groups"),
        where("inviteCode", "==", inviteCode.toUpperCase())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Invalid invite code");
        return false;
      }

      const groupDoc = querySnapshot.docs[0];
      const groupData = groupDoc.data();

      // Check if user is already a member
      if (groupData.members && groupData.members.includes(user.uid)) {
        toast.info("You are already a member of this group");
        return false;
      }

      // Add user to group
      const members = groupData.members || [];
      await updateDoc(doc(db, "splitwise_groups", groupDoc.id), {
        members: [...members, user.uid],
      });

      toast.success("Joined group successfully!");
      fetchUserGroups();
      setIsJoinGroupModalVisible(false);
      return true;
    } catch (error) {
      console.error("Error joining group:", error);
      toast.error("Failed to join group");
      return false;
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
      await deleteDoc(doc(db, "splitwise_groups", groupId));
      toast.success("Group deleted successfully!");
      fetchUserGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    }
  };

  return (
    <div className="p-2 min-h-screen bg-gray-50">
      <Header />
      <div className="p-4 md:p-6 lg:p-8 max-w-screen-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Splitwise</h1>
          <p className="text-gray-600">
            Split expenses with friends and settle debts easily
          </p>
        </div>

        {!user ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">Loading user information...</p>
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setIsCreateGroupModalVisible(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create Group
              </button>
              <button
                onClick={() => setIsJoinGroupModalVisible(true)}
                className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
              >
                Join Group
              </button>
            </div>

            {loading ? (
              <Loader />
            ) : groups.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 text-lg">No groups yet</p>
                <p className="text-gray-400">Create or join a group to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onDelete={handleDeleteGroup}
                    onView={() => navigate(`/splitwise/${group.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <CreateGroupModal
        isVisible={isCreateGroupModalVisible}
        onCancel={() => setIsCreateGroupModalVisible(false)}
        onFinish={handleCreateGroup}
      />

      <JoinGroupModal
        isVisible={isJoinGroupModalVisible}
        onCancel={() => setIsJoinGroupModalVisible(false)}
        onFinish={handleJoinGroup}
      />
    </div>
  );
};

export default Splitwise;
