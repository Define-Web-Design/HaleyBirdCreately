
import * as React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MoreHorizontal, GripVertical, Edit, Trash, Eye } from "lucide-react";
import { Modal, useModal } from "./modal";

interface Page {
  id: string;
  title: string;
  path: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface PageSorterProps {
  pages: Page[];
  onSortChange: (sortedPages: Page[]) => void;
  onView: (page: Page) => void;
  onEdit: (page: Page) => void;
  onDelete: (page: Page) => void;
}

export function PageSorter({
  pages: initialPages,
  onSortChange,
  onView,
  onEdit,
  onDelete
}: PageSorterProps) {
  const [pages, setPages] = React.useState<Page[]>(initialPages);
  const [selectedPage, setSelectedPage] = React.useState<Page | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  React.useEffect(() => {
    setPages(initialPages);
  }, [initialPages]);

  const onDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPages(items);
    onSortChange(items);
  };

  const confirmDelete = (page: Page) => {
    setSelectedPage(page);
    openModal();
  };

  const handleDelete = () => {
    if (selectedPage) {
      onDelete(selectedPage);
      closeModal();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Sort Pages
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Drag and drop pages to reorder them
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="pages">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="divide-y divide-gray-200 dark:divide-gray-700"
            >
              {pages.map((page, index) => (
                <Draggable key={page.id} draggableId={page.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          {...provided.dragHandleProps}
                          className="text-gray-400"
                        >
                          <GripVertical className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {page.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {page.type} • Last updated {new Date(page.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onView(page)}
                          className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          aria-label="View page"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(page)}
                          className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          aria-label="Edit page"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(page)}
                          className="p-1.5 rounded-full text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                          aria-label="Delete page"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      <Modal isOpen={isOpen} onClose={closeModal} title="Confirm Delete">
        <div className="space-y-4">
          <p>
            Are you sure you want to delete the page "
            {selectedPage?.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
