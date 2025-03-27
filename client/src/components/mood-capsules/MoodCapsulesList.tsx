import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { MoodCapsule } from '@/lib/types';
import MoodCapsuleCard from './MoodCapsuleCard';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { 
  PlusCircle, 
  Filter, 
  Search, 
  SortAsc, 
  RefreshCw,
  ArchiveIcon,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface MoodCapsulesListProps {
  onCreateCapsule: () => void;
  onEditCapsule: (capsule: MoodCapsule) => void;
  onViewCapsule: (capsule: MoodCapsule) => void;
  onAutoCreateCapsules: () => void;
}

const MoodCapsulesList: React.FC<MoodCapsulesListProps> = ({ 
  onCreateCapsule,
  onEditCapsule,
  onViewCapsule,
  onAutoCreateCapsules
}) => {
  const { toast } = useToast();
  const [tab, setTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterTone, setFilterTone] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Query to fetch mood capsules
  const { data: capsules, isLoading, refetch } = useQuery<MoodCapsule[]>({
    queryKey: ['/api/mood-capsules'],
    refetchOnWindowFocus: false,
  });

  // Filter and sort capsules
  const filteredCapsules = React.useMemo(() => {
    if (!capsules) return [];
    
    // Filter by search term
    let result = capsules.filter((capsule) => {
      const matchesSearch = searchTerm === "" || 
        capsule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (capsule.description?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by tab selection
      const matchesTab = tab === "all" || 
        (tab === "archived" && capsule.isArchived) || 
        (tab === "active" && !capsule.isArchived);
      
      // Filter by emotional tone
      const matchesTone = filterTone === "" || 
        capsule.emotionalTone.toLowerCase() === filterTone.toLowerCase();
      
      return matchesSearch && matchesTab && matchesTone;
    });
    
    // Sort capsules
    result = result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "items-desc":
          return (b.contentIds?.length || 0) - (a.contentIds?.length || 0);
        default:
          return 0;
      }
    });
    
    return result;
  }, [capsules, searchTerm, tab, filterTone, sortBy]);
  
  // Paginate results
  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredCapsules.length / itemsPerPage);
  const paginatedCapsules = filteredCapsules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Extract unique emotional tones for filtering
  const emotionalTones = React.useMemo(() => {
    if (!capsules) return [];
    const tones = new Set(capsules.map(c => c.emotionalTone.toLowerCase()));
    return Array.from(tones);
  }, [capsules]);
  
  // Handle refreshing the list
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Refreshed",
        description: "Mood capsules list has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh mood capsules",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle archiving a capsule
  const handleArchiveCapsule = async (capsule: MoodCapsule) => {
    try {
      await apiRequest({
        url: `/api/mood-capsules/${capsule.id}`,
        method: 'PATCH',
        data: { isArchived: !capsule.isArchived },
      });
      
      refetch();
      
      toast({
        title: capsule.isArchived ? "Unarchived" : "Archived",
        description: `"${capsule.name}" ${capsule.isArchived ? "removed from" : "moved to"} archives`,
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Could not archive/unarchive mood capsule",
        variant: "destructive",
      });
    }
  };
  
  // Handle deleting a capsule
  const handleDeleteCapsule = (capsule: any) => {
    // For demonstration purposes - would need a proper delete API call
    console.log('Delete capsule:', capsule.id);
    
    toast({
      title: "Not Implemented",
      description: "Delete functionality is not yet implemented",
      variant: "destructive",
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search capsules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          
          {/* Filter by Tone */}
          <div className="w-full sm:w-auto">
            <Select value={filterTone} onValueChange={setFilterTone}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by tone" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All tones</SelectItem>
                {emotionalTones.map((tone) => (
                  <SelectItem key={tone} value={tone} className="capitalize">
                    {tone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Button Group */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            onClick={onAutoCreateCapsules}
            size="sm"
            variant="outline"
            className="hidden sm:flex"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Create
          </Button>
          
          <Button 
            onClick={onCreateCapsule}
            size="sm"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Capsule
          </Button>
        </div>
      </div>
      
      {/* Tabs and Sorting */}
      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" value={tab} onValueChange={setTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Capsules</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2 mt-4">
            <SortAsc className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="items-desc">Most items</SelectItem>
              </SelectContent>
            </Select>
            
            {searchTerm && (
              <Badge variant="outline" className="ml-2">
                Search: {searchTerm}
                <button 
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:text-primary"
                >
                  ×
                </button>
              </Badge>
            )}
            
            {filterTone && (
              <Badge variant="outline" className="ml-2 capitalize">
                Tone: {filterTone}
                <button 
                  onClick={() => setFilterTone("")}
                  className="ml-1 hover:text-primary"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <TabsContent value="all" className="space-y-4">
            {renderCapsuleGrid(paginatedCapsules)}
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            {renderCapsuleGrid(paginatedCapsules)}
          </TabsContent>
          
          <TabsContent value="archived" className="space-y-4">
            {renderCapsuleGrid(paginatedCapsules)}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="gap-1 pl-2.5"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                Prev
              </Button>
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="gap-1 pr-2.5"
              >
                Next
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M6.1584 3.13514C5.95694 3.32401 5.94673 3.64042 6.13559 3.84188L9.565 7.49991L6.13559 11.1579C5.94673 11.3594 5.95694 11.6758 6.1584 11.8647C6.35986 12.0535 6.67627 12.0433 6.86513 11.8419L10.6151 7.84188C10.7954 7.64955 10.7954 7.35027 10.6151 7.15794L6.86513 3.15794C6.67627 2.95648 6.35986 2.94628 6.1584 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
  
  // Helper function to render grid of capsules
  function renderCapsuleGrid(capsules: MoodCapsule[]) {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-center">
            <div className="h-12 w-12 rounded-full bg-primary/20 mx-auto mb-4"></div>
            <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
          </div>
        </div>
      );
    }
    
    if (!capsules || capsules.length === 0) {
      return (
        <Card className="py-12">
          <CardContent className="text-center p-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              {tab === "archived" ? (
                <ArchiveIcon className="h-8 w-8 text-muted-foreground" />
              ) : (
                <PlusCircle className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-lg font-medium mb-2">No {tab === "all" ? "" : tab} capsules found</h3>
            <p className="text-muted-foreground mb-6">
              {tab === "archived" 
                ? "No archived mood capsules available"
                : searchTerm || filterTone 
                  ? "Try adjusting your search or filters"
                  : "Create your first mood capsule to organize your content"}
            </p>
            {tab !== "archived" && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={onCreateCapsule}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Manually
                </Button>
                
                <Button onClick={onAutoCreateCapsules} variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Auto-Create with AI
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {capsules.map((capsule) => (
            <MoodCapsuleCard
              key={capsule.id}
              capsule={capsule}
              onView={onViewCapsule}
              onEdit={onEditCapsule}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  }
};

export default MoodCapsulesList;