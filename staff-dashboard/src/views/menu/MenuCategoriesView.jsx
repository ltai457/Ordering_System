import clsx from 'clsx'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import useMenuCategoriesViewModel from '../../viewmodels/menu/useMenuCategoriesViewModel.js'

const MenuCategoriesView = () => {
  const {
    categories,
    isLoading,
    error,
    successMessage,
    isFormOpen,
    form,
    formErrors,
    isSubmitting,
    currentCategory,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormChange,
    handleSubmit,
    handleDelete,
    handleToggleVisibility,
    handleReorder,
    statusFilter,
    setStatusFilter,
    reload,
  } = useMenuCategoriesViewModel()

  const onDragEnd = (result) => {
    if (!result.destination) {
      return
    }

    handleReorder(result.source.index, result.destination.index)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Menu Categories</h2>
          <p className="text-sm text-slate-400">
            Organize your menu into sections and control their display order.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5"
            onClick={reload}
            type="button"
          >
            Refresh
          </button>
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
            onClick={openCreateForm}
            type="button"
          >
            New Category
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successMessage}
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {[
            { key: 'all', label: 'All' },
            { key: 'visible', label: 'Visible to customers' },
            { key: 'hidden', label: 'Hidden' },
          ].map(({ key, label }) => (
            <button
              className={clsx(
                'rounded-full px-4 py-2 text-sm font-medium transition',
                statusFilter === key
                  ? 'bg-primary text-white'
                  : 'border border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5',
              )}
              key={key}
              onClick={() => setStatusFilter(key)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-sidebar/60 px-6 py-10 text-center text-sm text-slate-400">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 bg-sidebar/40 px-6 py-10 text-center text-sm text-slate-400">
            {statusFilter === 'hidden'
              ? 'No hidden categories.'
              : statusFilter === 'visible'
                ? 'No visible categories yet.'
                : 'No categories yet. Click "New Category" to create the first one.'}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="categories-list" direction="horizontal">
              {(provided) => (
                <div
                  className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {categories.map((category, index) => (
                    <Draggable key={category.id} draggableId={String(category.id)} index={index}>
                      {(provided, snapshot) => (
                        <article
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={clsx(
                            "flex h-full flex-col rounded-2xl border bg-sidebar/70 shadow-lg transition overflow-hidden",
                            snapshot.isDragging
                              ? "border-primary/60 shadow-primary/30 ring-2 ring-primary/40"
                              : "border-white/10 hover:border-primary/40 hover:shadow-primary/10"
                          )}
                        >
                          <div className="flex flex-col h-full">
                  {/* Image container with aspect ratio */}
                  {category.imageUrl ? (
                    <div className="w-full aspect-[16/10] bg-surface/50 overflow-hidden">
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[16/10] bg-surface/50 flex items-center justify-center">
                      <svg
                        className="h-12 w-12 sm:h-16 sm:w-16 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Content section */}
                  <div className="flex flex-col flex-1 p-4 sm:p-5">
                    {/* Drag handle and position */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                      <div
                        {...provided.dragHandleProps}
                        className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-primary transition"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 7h18M3 12h18M3 17h18"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-xs font-medium">Drag to reorder</span>
                      </div>
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                        Position #{index + 1}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-white line-clamp-2">{category.name}</h3>
                        <span
                          className={clsx(
                            'inline-flex items-center rounded-full px-2 sm:px-3 py-1 text-xs font-semibold whitespace-nowrap flex-shrink-0',
                            category.isActive
                              ? 'bg-emerald-500/10 text-emerald-200'
                              : 'bg-slate-600/20 text-slate-400',
                          )}
                        >
                          {category.isActive ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                        {category.description || 'No description provided.'}
                      </p>

                      <dl className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                        {/* <div>
                          <dt className="font-semibold text-slate-300">Display order</dt>
                          <dd>{category.displayOrder}</dd>
                        </div> */}
                        <div>
                          <dt className="font-semibold text-slate-300">Visibility</dt>
                          <dd>{category.isActive ? 'Shown to guests' : 'Staff only'}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-primary/40 hover:bg-primary/10"
                        onClick={() => handleToggleVisibility(category)}
                        type="button"
                      >
                        <svg
                          className="h-4 w-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M15 12h6m-3-3v6M4 6h7a4 4 0 0 1 4 4v9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M4 18h7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="truncate">{category.isActive ? 'Hide from customers' : 'Show to customers'}</span>
                      </button>

                      <div className="flex gap-2">
                        <button
                          className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/5"
                          onClick={() => openEditForm(category)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="flex-1 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-200 transition hover:border-red-500/60 hover:bg-red-500/10"
                          onClick={() => handleDelete(category)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                        </article>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-sidebar/90 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {currentCategory ? 'Edit Category' : 'Create Category'}
                </h3>
                <p className="text-xs text-slate-400">
                  Provide the details that appear in the digital menu.
                </p>
              </div>
              <button
                className="text-slate-400 transition hover:text-white"
                onClick={closeForm}
                type="button"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="block text-sm font-medium text-slate-300" htmlFor="category-name">
                  Name
                </label>
                <input
                  autoFocus
                  className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  id="category-name"
                  name="name"
                  onChange={handleFormChange('name')}
                  placeholder="e.g. Appetizers"
                  type="text"
                  value={form.name}
                />
                {formErrors.name ? (
                  <p className="mt-1 text-xs text-red-300">{formErrors.name}</p>
                ) : null}
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-slate-300"
                  htmlFor="category-description"
                >
                  Description
                </label>
                <textarea
                  className="mt-1 h-24 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  id="category-description"
                  name="description"
                  onChange={handleFormChange('description')}
                  placeholder="Brief description shown to guests"
                  value={form.description}
                />
                {formErrors.description ? (
                  <p className="mt-1 text-xs text-red-300">{formErrors.description}</p>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* <div>
                  <label
                    className="block text-sm font-medium text-slate-300"
                    htmlFor="category-display-order"
                  >
                    Display Order
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    id="category-display-order"
                    min={0}
                    name="displayOrder"
                    onChange={handleFormChange('displayOrder')}
                    type="number"
                    value={form.displayOrder}
                  />
                  {formErrors.displayOrder ? (
                    <p className="mt-1 text-xs text-red-300">{formErrors.displayOrder}</p>
                  ) : null}
                </div> */}

                <div className="flex items-center gap-3">
                  <input
                    checked={form.isActive}
                    className="h-4 w-4 rounded border-white/20 bg-surface text-primary focus:ring-primary/40"
                    id="category-is-active"
                    name="isActive"
                    onChange={handleFormChange('isActive')}
                    type="checkbox"
                  />
                  <label className="text-sm text-slate-300" htmlFor="category-is-active">
                    Visible to customers
                  </label>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-slate-300"
                  htmlFor="category-image"
                >
                  Category Image
                </label>
                <div className="mt-2 space-y-3">
                  {/* Show current image if editing and has image */}
                  {currentCategory?.imageUrl && !form.imageFile ? (
                    <div className="relative">
                      <img
                        src={currentCategory.imageUrl}
                        alt="Current category"
                        className="h-32 w-full rounded-lg object-cover border border-white/10"
                      />
                      <p className="mt-1 text-xs text-slate-400">Current image</p>
                    </div>
                  ) : null}

                  {/* Show preview of new image if selected */}
                  {form.imageFile ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(form.imageFile)}
                        alt="Preview"
                        className="h-32 w-full rounded-lg object-cover border border-primary/40"
                      />
                      <p className="mt-1 text-xs text-emerald-300">New image selected</p>
                    </div>
                  ) : null}

                  <input
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer border border-white/10 rounded-lg bg-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    id="category-image"
                    name="imageFile"
                    onChange={handleFormChange('imageFile')}
                    type="file"
                  />
                  <p className="text-xs text-slate-400">
                    JPG, PNG, GIF, or WebP (max 5MB)
                  </p>
                  {formErrors.imageFile ? (
                    <p className="text-xs text-red-300">{formErrors.imageFile}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5"
                  onClick={closeForm}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : currentCategory
                      ? 'Update Category'
                      : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default MenuCategoriesView
