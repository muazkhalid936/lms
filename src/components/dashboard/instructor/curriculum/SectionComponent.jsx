import React from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
  Trash2,
  Play,
  FileText,
  HelpCircle,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableLectureItem = ({ lecture, sectionId, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lecture._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="m-4 rounded-[6px] flex items-center justify-between border border-[var(--gray-100)] px-6 py-3 bg-white hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical size={16} className="text-gray-400" />
        </div>
        <div className="bg-[var(--green-500)] p-1.5 rounded-full flex items-center justify-center">
          {lecture.type === "document" ? (
            <FileText size={14} className="text-white fill-white" />
          ) : lecture.type === "quiz" ? (
            <HelpCircle size={14} className="text-white fill-white" />
          ) : (
            <Play size={10} className="text-white fill-white" />
          )}
        </div>
        <span
          className={`${
            lecture.isPublished ? "text-gray-900" : "text-gray-700"
          }`}
        >
          {lecture.title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(sectionId, lecture);
          }}
        >
          <Edit size={16} className="text-gray-500" />
        </button>
        <button
          className="p-2 hover:bg-red-100 rounded-full transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(sectionId, lecture._id);
          }}
        >
          <Trash2 size={16} className="text-[var(--rose-500)]" />
        </button>
      </div>
    </div>
  );
};

const SectionComponent = ({
  section,
  expandedSections,
  onToggleSection,
  onEditSection,
  onDeleteSection,
  onAddLectureClick,
  onEditLecture,
  onDeleteLecture,
  onEditQuiz,
  onDeleteQuiz,
  onDragEnd,
  sensors,
}) => {
  const isExpanded = expandedSections[section._id];

  return (
    <div className="border border-[var(--gray-100)] rounded-[6px] bg-white mb-4">
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => onToggleSection(section._id)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-[var(--indigo-800)] p-1.5 rounded-full flex items-center justify-center">
            {isExpanded ? (
              <ChevronUp size={14} className="text-white" />
            ) : (
              <ChevronDown size={14} className="text-white" />
            )}
          </div>
          <span className="font-medium text-gray-900">{section.title}</span>
          <span className="text-sm text-gray-500">
            {section.lessons?.length || 0} lectures •{" "}
            {section.quizzes?.length || 0} quizzes
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEditSection(section);
            }}
          >
            <Edit size={16} className="text-gray-500" />
          </button>
          <button
            className="p-2 hover:bg-red-100 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSection(section._id);
            }}
          >
            <Trash2 size={16} className="text-[var(--rose-500)]" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-[var(--gray-100)]">
          {/* Lessons */}
          {section.lessons && section.lessons.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => onDragEnd(event, section._id)}
            >
              <SortableContext
                items={section.lessons.map((lesson) => lesson._id)}
                strategy={verticalListSortingStrategy}
              >
                {section.lessons.map((lesson) => (
                  <SortableLectureItem
                    key={lesson._id}
                    lecture={lesson}
                    sectionId={section._id}
                    onEdit={onEditLecture}
                    onDelete={onDeleteLecture}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}

          {/* Quizzes */}
          {section.quizzes &&
            section.quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="m-4 rounded-[6px] flex items-center justify-between border border-[var(--gray-100)] px-6 py-3 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[var(--green-500)] p-1.5 rounded-full flex items-center justify-center">
                    <HelpCircle size={14} className="text-white fill-white" />
                  </div>
                  <span className="text-gray-900">{quiz.title}</span>
                  <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded">
                    Quiz
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditQuiz(quiz, section._id);
                    }}
                  >
                    <Edit size={16} className="text-gray-500" />
                  </button>
                  <button
                    className="p-2 hover:bg-red-100 rounded-full transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteQuiz(quiz._id);
                    }}
                  >
                    <Trash2 size={16} className="text-[var(--rose-500)]" />
                  </button>
                </div>
              </div>
            ))}

          <div className="px-6 py-4">
            <button
              className="bg-[var(--indigo-800)] cursor-pointer hover:bg-indigo-700 text-[14px] text-white py-[8px] px-[20px] rounded-[100px] font-medium flex items-center gap-2 transition-colors"
              onClick={() => onAddLectureClick(section._id)}
            >
              <div className="rounded-full bg-white">
                <Plus size={15} className="text-black" />
              </div>
              Add Course Content
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionComponent;