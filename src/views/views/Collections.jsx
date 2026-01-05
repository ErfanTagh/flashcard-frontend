import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollections";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, Trash2, Edit2, Star, StarOff, Plus, BookOpen, Check, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

function Collections() {
  const { user, isLoading } = useAuth();
  const { collections, defaultCollection, fetchCollections, deleteCollection, setDefault, setSelectedCollection } = useCollections();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [isDeletingCollection, setIsDeletingCollection] = useState(false);
  const [collectionToRename, setCollectionToRename] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isRenamingCollection, setIsRenamingCollection] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCollectionNameInput, setNewCollectionNameInput] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [selectedCollectionForCard, setSelectedCollectionForCard] = useState(null);
  const [newCardInputs, setNewCardInputs] = useState({ term: "", definition: "" });
  const [isAddingCard, setIsAddingCard] = useState(false);

  useEffect(() => {
    if (user?.email && !isLoading) {
      fetchStats();
    }
  }, [user, isLoading, collections]);

  const fetchStats = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/collections/${user.email}/stats`, { mode: "cors" });
      const data = await response.json();
      
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching collection stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!collectionToDelete) return;

    setIsDeletingCollection(true);
    try {
      const result = await deleteCollection(collectionToDelete);
      if (result.success) {
        toast({ title: "Collection Deleted", description: `"${collectionToDelete}" has been deleted.` });
        await fetchStats();
        setCollectionToDelete(null);
      } else {
        toast({ title: "Error", description: result.error || "Failed to delete collection.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Network Error", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsDeletingCollection(false);
      setCollectionToDelete(null);
    }
  };

  const handleRenameCollection = async () => {
    if (!collectionToRename || !newCollectionName.trim()) {
      toast({ title: "Invalid Input", description: "Please enter a valid collection name.", variant: "destructive" });
      return;
    }

    if (newCollectionName.trim() === collectionToRename) {
      setCollectionToRename(null);
      setNewCollectionName("");
      return;
    }

    setIsRenamingCollection(true);
    try {
      const response = await fetch(`/api/collections/${encodeURIComponent(collectionToRename)}/rename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          token: user.email,
          new_collection_name: newCollectionName.trim()
        })
      });

      const data = await response.json();
      
      if (data.status === 200) {
        toast({ title: "Collection Renamed", description: `"${collectionToRename}" has been renamed to "${newCollectionName.trim()}".` });
        await fetchCollections();
        await fetchStats();
        setCollectionToRename(null);
        setNewCollectionName("");
      } else {
        toast({ title: "Error", description: data.error || "Failed to rename collection.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error renaming collection:', error);
      toast({ title: "Network Error", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsRenamingCollection(false);
    }
  };

  const handleSetDefault = async (collectionName) => {
    try {
      const result = await setDefault(collectionName);
      if (result.success) {
        toast({ title: "Default Collection Set", description: `"${collectionName}" is now your default collection.` });
        await fetchStats();
      } else {
        toast({ title: "Error", description: result.error || "Failed to set default collection.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Network Error", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionNameInput.trim()) {
      toast({ title: "Collection name required", description: "Please enter a collection name.", variant: "destructive" });
      return;
    }

    setIsCreatingCollection(true);
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          token: user.email,
          collection_name: newCollectionNameInput.trim()
        })
      });

      const data = await response.json();
      
      if (data.status === 200) {
        toast({ title: "Collection Created", description: `"${newCollectionNameInput.trim()}" collection has been created.` });
        await fetchCollections();
        await fetchStats();
        setNewCollectionNameInput("");
        setShowCreateDialog(false);
      } else {
        toast({ title: "Error", description: data.error || "Failed to create collection.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      toast({ title: "Network Error", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const handleAddCard = async () => {
    if (!newCardInputs.term.trim() || !newCardInputs.definition.trim()) {
      toast({ title: "Missing Information", description: "Please fill in both term and definition.", variant: "destructive" });
      return;
    }

    if (!selectedCollectionForCard) {
      toast({ title: "No Collection Selected", description: "Please select a collection.", variant: "destructive" });
      return;
    }

    setIsAddingCard(true);
    try {
      const response = await fetch('/api/sendwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          token: user.email,
          word: newCardInputs.term.trim(),
          ans: newCardInputs.definition.trim(),
          collection: selectedCollectionForCard
        })
      });

      const data = await response.json();
      
      if (data.status === 200) {
        toast({ title: "Card Added Successfully!", description: `"${newCardInputs.term.trim()}" has been added to ${selectedCollectionForCard}.` });
        setNewCardInputs({ term: "", definition: "" });
        setShowAddCardDialog(false);
        setSelectedCollectionForCard(null);
        // Refresh stats after a short delay to ensure backend has processed the request
        setTimeout(() => {
          fetchStats();
        }, 300);
      } else {
        toast({ title: "Error", description: "Failed to add the card.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error adding card:', error);
      toast({ title: "Network Error", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleOpenAddCardDialog = (collectionName) => {
    setSelectedCollectionForCard(collectionName);
    setShowAddCardDialog(true);
  };

  const handleReviewCollection = (collectionName) => {
    setSelectedCollection(collectionName);
    navigate('/flashcards');
  };

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <main className="w-full max-w-full px-6 py-8 flex flex-col">
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Collections
              </h1>
              <p className="text-lg text-muted-foreground">Manage and organize your flashcard collections</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Collection
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Card key={collection} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-primary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{collection}</CardTitle>
                      {collection === defaultCollection && (
                        <Badge className="bg-accent text-accent-foreground">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {stats[collection] !== undefined ? `${stats[collection]} card${stats[collection] !== 1 ? 's' : ''}` : '0 cards'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleReviewCollection(collection)}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Review Cards
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAddCardDialog(collection)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Card
                    </Button>
                    <div className="flex gap-2">
                      {collection !== defaultCollection && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(collection)}
                          className="flex-1"
                        >
                          <StarOff className="h-4 w-4 mr-2" />
                          Set Default
                        </Button>
                      )}
                      {collection !== 'Default' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCollectionToRename(collection);
                              setNewCollectionName(collection);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setCollectionToDelete(collection)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {collections.length === 0 && !loading && (
          <Card className="mt-8">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Collections Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first collection to get started</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Collection
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Create Collection Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Create a new collection to organize your flashcards.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newCollection">Collection Name</Label>
              <Input
                id="newCollection"
                value={newCollectionNameInput}
                onChange={(e) => setNewCollectionNameInput(e.target.value)}
                placeholder="e.g., Spanish, History, Math"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateCollection();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateCollection} disabled={isCreatingCollection}>
              {isCreatingCollection ? "Creating..." : "Create Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Collection Dialog */}
      <Dialog open={collectionToRename !== null} onOpenChange={(open) => !open && setCollectionToRename(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Collection</DialogTitle>
            <DialogDescription>
              Enter a new name for "{collectionToRename}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="renameCollection">New Collection Name</Label>
              <Input
                id="renameCollection"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Enter new name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRenameCollection();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCollectionToRename(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleRenameCollection} disabled={isRenamingCollection}>
              {isRenamingCollection ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Card Dialog */}
      <Dialog open={showAddCardDialog} onOpenChange={setShowAddCardDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Card to "{selectedCollectionForCard}"</DialogTitle>
            <DialogDescription>
              Create a new flashcard in this collection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardTerm">Term *</Label>
              <Input
                id="cardTerm"
                value={newCardInputs.term}
                onChange={(e) => setNewCardInputs({ ...newCardInputs, term: e.target.value })}
                placeholder="Enter the term or concept"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    handleAddCard();
                  }
                }}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {newCardInputs.term.length}/100 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardDefinition">Definition *</Label>
              <Textarea
                id="cardDefinition"
                value={newCardInputs.definition}
                onChange={(e) => setNewCardInputs({ ...newCardInputs, definition: e.target.value })}
                placeholder="Enter the definition or explanation"
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {newCardInputs.definition.length}/500 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddCardDialog(false);
                setNewCardInputs({ term: "", definition: "" });
                setSelectedCollectionForCard(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddCard}
              disabled={isAddingCard || !newCardInputs.term.trim() || !newCardInputs.definition.trim()}
            >
              {isAddingCard ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Add Card
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Collection Confirmation Dialog */}
      <AlertDialog open={collectionToDelete !== null} onOpenChange={(open) => !open && setCollectionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{collectionToDelete}"? This will permanently delete all {stats[collectionToDelete] || 0} flashcard{stats[collectionToDelete] !== 1 ? 's' : ''} in this collection. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCollection}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCollection}
              disabled={isDeletingCollection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingCollection ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Collections;

