import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollections";
import { Plus, Check, FolderPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function AddFlashcard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { collections, selectedCollection, setSelectedCollection, createCollection, deleteCollection, loading } = useCollections();
  const [inputs, setInputs] = useState({ title: "", ans: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [isDeletingCollection, setIsDeletingCollection] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast({ title: "Collection name required", description: "Please enter a collection name.", variant: "destructive" });
      return;
    }

    setIsCreatingCollection(true);
    try {
      const result = await createCollection(newCollectionName);
      if (result.success) {
        toast({ title: "Collection Created", description: `"${newCollectionName}" collection has been created.` });
        // The collection is already set as selected in the createCollection function
        setNewCollectionName("");
        setShowNewCollectionDialog(false);
      } else {
        toast({ title: "Error", description: result.error || "Failed to create collection.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Network Error", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!inputs.title.trim() || !inputs.ans.trim()) {
      toast({ title: "Missing Information", description: "Please fill in both fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ 
          token: user.email, 
          word: inputs.title, 
          ans: inputs.ans,
          collection: selectedCollection || 'Default'
        }),
      };
      const response = await fetch("/api/sendwords", requestOptions);
      const data = await response.json();
      if (data["status"] === 200) {
        toast({ title: "Card Added Successfully!", description: `"${inputs.title}" has been added to ${selectedCollection || 'Default'}.` });
        setInputs({ title: "", ans: "" });
      } else {
        toast({ title: "Error", description: "Failed to add the card.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Network Error", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => setInputs({ title: "", ans: "" });

  const handleDeleteCollection = async () => {
    if (!collectionToDelete) return;
    if (collectionToDelete === 'Default') {
      toast({ title: "Cannot Delete", description: "The Default collection cannot be deleted.", variant: "destructive" });
      setCollectionToDelete(null);
      return;
    }

    setIsDeletingCollection(true);
    try {
      const result = await deleteCollection(collectionToDelete);
      if (result.success) {
        toast({ title: "Collection Deleted", description: `"${collectionToDelete}" collection has been deleted.` });
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

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-block p-3 bg-primary/10 rounded-2xl mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Add New Flashcard
            </h1>
            <p className="text-muted-foreground text-lg">Create a new card to expand your learning collection</p>
          </div>

          <Card className="mb-6 border-primary/20 shadow-xl shadow-primary/10 overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10 border-b border-primary/10 px-8 py-6">
              <CardTitle className="text-primary text-xl">New Flashcard</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="collection" className="text-sm font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
                    Collection *
                  </Label>
                  <div className="flex gap-2">
                    <Select value={selectedCollection} onValueChange={setSelectedCollection} disabled={loading} className="flex-1">
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((collection) => (
                          <SelectItem key={collection} value={collection}>
                            {collection}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={showNewCollectionDialog} onOpenChange={setShowNewCollectionDialog}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" className="h-12 px-4">
                          <FolderPlus className="h-4 w-4 mr-2" />
                          New
                        </Button>
                      </DialogTrigger>
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
                              value={newCollectionName}
                              onChange={(e) => setNewCollectionName(e.target.value)}
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
                          <Button type="button" variant="outline" onClick={() => setShowNewCollectionDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="button" onClick={handleCreateCollection} disabled={isCreatingCollection}>
                            {isCreatingCollection ? "Creating..." : "Create Collection"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    Term *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    name="title"
                    placeholder="Enter the term or concept"
                    value={inputs.title}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border-primary/30 focus:border-primary focus:ring-primary/20 text-base"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground pl-1">
                    {inputs.title.length}/100 characters
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="ans" className="text-sm font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
                    Definition *
                  </Label>
                  <Textarea
                    id="ans"
                    name="ans"
                    placeholder="Enter the definition or explanation"
                    value={inputs.ans}
                    onChange={handleChange}
                    className="w-full min-h-[140px] p-4 resize-none border-accent/30 focus:border-accent focus:ring-accent/20 text-base leading-relaxed"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground pl-1">
                    {inputs.ans.length}/500 characters
                  </p>
                </div>

                <div className="flex gap-4 pt-6 border-t border-border/50">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !inputs.title.trim() || !inputs.ans.trim()}
                    className="flex-1 h-12 text-base font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Add Card
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="h-12 px-6 text-base"
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Collection Confirmation Dialog */}
      <AlertDialog open={collectionToDelete !== null} onOpenChange={(open) => !open && setCollectionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{collectionToDelete}"? This will permanently delete all flashcards in this collection. This action cannot be undone.
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

export default AddFlashcard;
