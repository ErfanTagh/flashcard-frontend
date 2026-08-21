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
import { FolderOpen, Trash2, Edit2, Star, StarOff, Plus, BookOpen, Check, Play, GraduationCap, ArrowLeft, Share2, Copy, ImageIcon, FileJson, ListChecks, Users, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ImportDeckDialog from "@/Components/ImportDeckDialog";
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
  const [shouldKeepDialogOpen, setShouldKeepDialogOpen] = useState(false);
  const [selectedCollectionForCard, setSelectedCollectionForCard] = useState(null);
  const [newCardInputs, setNewCardInputs] = useState({ term: "", definition: "" });
  // The collection whose share link is on screen, and the link itself.
  // Deck covers, keyed by deck name, as returned by /api/collections.
  const [covers, setCovers] = useState({});
  // Decks followed through a share link rather than owned.
  const [linked, setLinked] = useState([]);
  const [progress, setProgress] = useState({});
  const [owners, setOwners] = useState({});
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [coverUploading, setCoverUploading] = useState(null);
  const [shareFor, setShareFor] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareAllowsEdit, setShareAllowsEdit] = useState(false);
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
      // Per-deck progress and, for followed decks, who owns them.
      setProgress(data.progress || {});
      setOwners(data.owners || {});
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
        setShouldKeepDialogOpen(true); // Flag to keep dialog open
        // Refresh stats after a short delay to ensure backend has processed the request
        setTimeout(() => {
          fetchStats();
          setShouldKeepDialogOpen(false); // Reset flag after stats update
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
    setShouldKeepDialogOpen(false); // Reset flag when opening
    setShowAddCardDialog(true);
  };

  const handleReviewCollection = (collectionName) => {
    setSelectedCollection(collectionName);
    navigate('/flashcards');
  };

  if (isLoading || !user) {
    return null;
  }

  const loadCovers = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/collections/${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setCovers(data.covers || {});
      setLinked(data.linked || []);
    } catch {
      // A missing cover is cosmetic; the page works without it.
    }
  };

  useEffect(() => { loadCovers(); }, [user?.email, collections.length]);

  // Refetch whenever this page is opened. Anything that changed the decks
  // elsewhere -- a share import, a JSON import, another tab -- happened after
  // the context last loaded, and arriving here is exactly when the list has to
  // be right.
  useEffect(() => {
    if (user?.email) fetchCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCoverChange = async (collection, file) => {
    if (!file || !user?.email) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Not an image", description: "Choose a picture file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Picture too large", description: "The limit is 5MB.", variant: "destructive" });
      return;
    }

    setCoverUploading(collection);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("token", user.email);
      const upload = await fetch("/api/images", { method: "POST", body: form });
      const uploaded = await upload.json();
      if (uploaded.status !== 200) throw new Error(uploaded.error || "Upload failed");

      const res = await fetch(`/api/collections/${encodeURIComponent(collection)}/cover`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ token: user.email, image: uploaded.image_id }),
      });
      const data = await res.json();
      if (data.status !== 200) throw new Error(data.error || "Couldn't set the cover");

      setCovers((current) => ({ ...current, [collection]: uploaded.image_id }));
      toast({ title: "Cover updated", description: `"${collection}" has a new picture.` });
    } catch (error) {
      toast({ title: "Couldn't set the cover", description: error.message, variant: "destructive" });
    } finally {
      setCoverUploading(null);
    }
  };

  const handleShare = async (collection) => {
    if (!user?.email) return;
    setIsSharing(true);
    setShareFor(collection);
    setShareLink("");
    try {
      const res = await fetch(`/api/collections/${encodeURIComponent(collection)}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        // The name comes from the account, recorded at sign-in; see /api/profile.
        body: JSON.stringify({ token: user.email }),
      });
      const data = await res.json();
      if (data.status !== 200) throw new Error(data.error || "Could not create a link");
      setShareLink(`${window.location.origin}${data.path}`);
      setShareAllowsEdit(Boolean(data.allow_edit));
    } catch (error) {
      toast({ title: "Couldn't share", description: error.message, variant: "destructive" });
      setShareFor(null);
    } finally {
      setIsSharing(false);
    }
  };

  const setCollaboration = async (allowed) => {
    if (!user?.email || !shareFor) return;
    setShareAllowsEdit(allowed); // optimistic: the switch should not lag the tap
    try {
      const res = await fetch(`/api/collections/${encodeURIComponent(shareFor)}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ token: user.email, allow_edit: allowed }),
      });
      const data = await res.json();
      if (data.status !== 200) throw new Error(data.error || "Couldn't change the link");
      setShareAllowsEdit(Boolean(data.allow_edit));
    } catch (error) {
      setShareAllowsEdit(!allowed);
      toast({ title: "Couldn't change the link", description: error.message, variant: "destructive" });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast({ title: "Link copied", description: "Anyone with it can add a copy of this collection." });
    } catch {
      // Clipboard access needs a secure context; the field is selectable anyway.
      toast({ title: "Copy it manually", description: "Select the link and copy.", variant: "destructive" });
    }
  };

  const handleStopSharing = async () => {
    if (!user?.email || !shareFor) return;
    try {
      await fetch(`/api/collections/${encodeURIComponent(shareFor)}/share`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ token: user.email }),
      });
      toast({ title: "Sharing stopped", description: "The old link no longer works. Copies already made are unaffected." });
    } catch {
      toast({ title: "Couldn't stop sharing", variant: "destructive" });
    } finally {
      setShareFor(null);
      setShareLink("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <main className="w-full max-w-full px-4 sm:px-6 py-8 flex flex-col min-w-0">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-2 sm:mb-4 self-start -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="mb-5 sm:mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 min-w-0">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Collections
              </h1>
              {/* Hidden until there is genuinely room for it. On a phone it
                  costs a whole deck of vertical space, and at tablet width it
                  wraps to two lines beside the buttons -- in both cases paying
                  vertical space for a sentence the page already demonstrates. */}
              <p className="hidden lg:block text-lg text-muted-foreground mt-2">
                Manage and organize your flashcard collections
              </p>
            </div>
            <div className="flex flex-row gap-2 shrink-0">
              <Button variant="outline" onClick={() => setShowImportDialog(true)} className="gap-2">
                <FileJson className="h-4 w-4" />
                Import JSON
              </Button>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Collection
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="flex items-center gap-4 p-3 sm:p-4 animate-pulse">
                <Skeleton className="h-14 w-14 shrink-0 rounded-lg sm:h-16 sm:w-16" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="hidden h-9 w-24 shrink-0 rounded-md sm:block" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {collections.map((collection) => {
              const isLinked = linked.includes(collection);
              const info = progress[collection] || {};
              const total = info.total ?? stats[collection] ?? 0;
              const known = info.known ?? 0;
              const toReview = info.needs_review ?? 0;
              // The two are disjoint by definition -- a card counts as known
              // only when it is not flagged -- so the shares never overshoot
              // the bar, and what is left of it is what has not been touched.
              // Deliberately unrounded: rounding each share independently can
              // add up to more than the whole.
              const knownShare = total ? (known / total) * 100 : 0;
              const reviewShare = total ? (toReview / total) * 100 : 0;
              const progressLabel = total === 0
                ? "No cards yet"
                : `${known} of ${total} known` + (toReview > 0 ? `, ${toReview} to review` : "");

              return (
              <Card key={collection} className="relative flex flex-wrap items-center gap-3 overflow-hidden p-3 pb-4 transition-all hover:shadow-md hover:border-primary/40 sm:flex-nowrap sm:gap-4 sm:p-4 sm:pb-5">
                {/* A small square rather than a banner: in a row the deck's
                    picture identifies it, it does not need to fill it.
                    Tapping it changes the picture. */}
                <label className="group/cover relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-gradient-to-br from-primary to-accent sm:h-16 sm:w-16">
                  {covers[collection] ? (
                    <img
                      src={`/api/images/${encodeURIComponent(covers[collection])}?email=${encodeURIComponent(user?.email || "")}`}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <BookOpen className="absolute inset-0 m-auto h-6 w-6 text-white/80" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover/cover:opacity-100 focus-within:opacity-100">
                    {coverUploading === collection
                      ? <span className="text-[10px] font-medium">Uploading…</span>
                      : <ImageIcon className="h-4 w-4" />}
                  </span>
                  <input
                    type="file" accept="image/*" className="sr-only"
                    disabled={coverUploading === collection}
                    onChange={(e) => { handleCoverChange(collection, e.target.files?.[0]); e.target.value = ""; }}
                  />
                </label>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold leading-tight">{collection}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {total} card{total === 1 ? "" : "s"}
                    {collection === defaultCollection && " · Default"}
                    {isLinked ? ` · by ${owners[collection] || "someone"}` : " · by you"}
                  </p>

                </div>

                <Button
                  onClick={() => { setSelectedCollection(collection); navigate(`/flashcards?collection=${encodeURIComponent(collection)}`); }}
                  className="w-full shrink-0 max-sm:order-last sm:w-auto sm:min-w-[7rem]"
                  disabled={total === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {total === 0 ? "Empty deck" : "Study"}
                </Button>

                {/* Everything except studying lives here, so a row reads as a
                    deck rather than a control panel. */}
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="shrink-0 h-10 w-10 p-0" aria-label={`Actions for ${collection}`}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => { setSelectedCollection(collection); navigate(`/quiz?collection=${encodeURIComponent(collection)}`); }}>
                    <GraduationCap className="h-4 w-4 mr-2" /> Quiz
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/collections/${encodeURIComponent(collection)}/cards`)}>
                    <ListChecks className="h-4 w-4 mr-2" /> Manage cards
                  </DropdownMenuItem>
                  {!isLinked && (
                    <DropdownMenuItem onClick={() => handleShare(collection)}>
                      <Share2 className="h-4 w-4 mr-2" /> Share
                    </DropdownMenuItem>
                  )}
                  {collection !== defaultCollection && (
                    <DropdownMenuItem onClick={() => handleSetDefault(collection)}>
                      <Star className="h-4 w-4 mr-2" /> Set as default
                    </DropdownMenuItem>
                  )}
                  {!isLinked && collection !== "Default" && (
                    <DropdownMenuItem onClick={() => { setCollectionToRename(collection); setNewCollectionName(collection); }}>
                      <Edit2 className="h-4 w-4 mr-2" /> Rename
                    </DropdownMenuItem>
                  )}
                  {(isLinked || collection !== "Default") && (
                    <DropdownMenuItem
                      onClick={() => setCollectionToDelete(collection)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isLinked ? "Stop following" : "Delete"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
                </DropdownMenu>

                {/* Laid along the bottom edge of the row rather than boxed
                    inside it: the full width of the deck reads as the deck,
                    and the three shares of it -- known, flagged, untouched --
                    read without any of them having to be spelled out.

                    It is the only place that says so, so it says it to a
                    screen reader too. */}
                <div
                  className="absolute inset-x-0 bottom-0 flex h-1 bg-muted"
                  role="img"
                  aria-label={progressLabel}
                  title={progressLabel}
                >
                  <div className="h-full bg-primary transition-all" style={{ width: `${knownShare}%` }} />
                  <div className="h-full bg-red-500 transition-all" style={{ width: `${reviewShare}%` }} />
                </div>
              </Card>
              );
            })}
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
      <Dialog 
        open={showAddCardDialog} 
        onOpenChange={(open) => {
          // Only close if we're not in the middle of keeping it open
          if (!open && !shouldKeepDialogOpen) {
            setShowAddCardDialog(false);
            setNewCardInputs({ term: "", definition: "" });
            setSelectedCollectionForCard(null);
          } else if (open) {
            setShowAddCardDialog(true);
          }
        }}
      >
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddCard();
              }}
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

      <ImportDeckDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        userEmail={user?.email}
        onImported={() => { fetchCollections(); loadCovers(); }}
      />

      {/* Share link */}
      <Dialog open={shareFor !== null} onOpenChange={(open) => { if (!open) { setShareFor(null); setShareLink(""); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share &ldquo;{shareFor}&rdquo;</DialogTitle>
            <DialogDescription>
              Anyone with this link can add their own copy of this collection. They
              get the cards, not your progress, and their copy is independent of
              yours from then on.
            </DialogDescription>
          </DialogHeader>

          {isSharing ? (
            <p className="text-sm text-muted-foreground py-4">Creating a link…</p>
          ) : (
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareLink}
                onFocus={(e) => e.target.select()}
                className="font-mono text-xs"
              />
              <Button onClick={handleCopyLink} className="shrink-0">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          )}

          <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={shareAllowsEdit}
              onChange={(e) => setCollaboration(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <span className="text-sm">
              <span className="font-medium">Let them edit this deck</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Everyone with the link works on this one deck, so corrections
                reach the whole group. They can add and change cards; only you
                can delete cards or the deck. Off means each person gets their
                own private copy instead.
              </span>
            </span>
          </label>

          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="ghost" onClick={handleStopSharing} className="text-destructive">
              Stop sharing
            </Button>
            <Button variant="outline" onClick={() => { setShareFor(null); setShareLink(""); }}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Collections;

