import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './useAuth';

const CollectionsContext = createContext();

export const CollectionsProvider = ({ children }) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [defaultCollection, setDefaultCollection] = useState('Default');
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState('Default');

  useEffect(() => {
    if (user?.email) {
      fetchCollections();
      setSelectedCollection('Default');
    }
  }, [user]);

  const fetchCollections = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/collections/${user.email}`, { mode: "cors" });
      const data = await response.json();
      
      if (data.collections && Array.isArray(data.collections)) {
        setCollections(data.collections);
        setDefaultCollection(data.default_collection || 'Default');
        setSelectedCollection(data.default_collection || 'Default');
      } else {
        // Fallback to Default collection
        setCollections(['Default']);
        setDefaultCollection('Default');
        setSelectedCollection('Default');
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      setCollections(['Default']);
      setDefaultCollection('Default');
      setSelectedCollection('Default');
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (collectionName) => {
    if (!user?.email) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          token: user.email,
          collection_name: collectionName.trim()
        })
      });

      const data = await response.json();
      
      if (data.status === 200) {
        await fetchCollections(); // Refresh collections
        // After refreshing, set the newly created collection as selected
        setSelectedCollection(collectionName.trim());
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to create collection' };
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const deleteCollection = async (collectionName) => {
    if (!user?.email) return { success: false, error: 'Not authenticated' };
    if (collectionName === 'Default') {
      return { success: false, error: 'Cannot delete Default collection' };
    }

    try {
      const response = await fetch(`/api/collections/${encodeURIComponent(collectionName)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token: user.email })
      });

      const data = await response.json();
      
      if (data.status === 200) {
        await fetchCollections(); // Refresh collections
        if (selectedCollection === collectionName) {
          setSelectedCollection('Default');
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to delete collection' };
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const setDefault = async (collectionName) => {
    if (!user?.email) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch('/api/collections/default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          token: user.email,
          collection_name: collectionName
        })
      });

      const data = await response.json();
      
      if (data.status === 200) {
        setDefaultCollection(collectionName);
        await fetchCollections(); // Refresh
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to set default collection' };
      }
    } catch (error) {
      console.error('Error setting default collection:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const value = {
    collections,
    defaultCollection,
    selectedCollection,
    setSelectedCollection,
    loading,
    fetchCollections,
    createCollection,
    deleteCollection,
    setDefault
  };

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
};

export const useCollections = () => {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error('useCollections must be used within a CollectionsProvider');
  }
  return context;
};

