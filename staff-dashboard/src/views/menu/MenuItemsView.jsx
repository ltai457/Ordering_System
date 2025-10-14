import clsx from 'clsx'
import useMenuItemsViewModel from '../../viewmodels/menu/useMenuItemsViewModel.js'

const MenuItemsView = () => {
  const {
    items,
    categories,
    isLoading,
    error,
    successMessage,
    isFormOpen,
    form,
    formErrors,
    isSubmitting,
    currentItem,
    categoryFilter,
    setCategoryFilter,
    searchTerm,
    setSearchTerm,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormChange,
    handleSubmit,
    handleDelete,
    handleToggleAvailability,
    reload,
  } = useMenuItemsViewModel()

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Menu Items</h2>
          <p className="text-sm text-slate-400">
            Manage individual dishes, drinks, and other items on your menu.
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
            New Item
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
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <input
              className="w-full rounded-lg border border-white/10 bg-surface px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items by name, description, or category..."
              type="text"
              value={searchTerm}
            />
          </div>
          <select
            className="rounded-lg border border-white/10 bg-surface px-4 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            onChange={(e) => setCategoryFilter(e.target.value)}
            value={categoryFilter}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-sidebar/60 px-6 py-10 text-center text-sm text-slate-400">
            Loading menu items...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 bg-sidebar/40 px-6 py-10 text-center text-sm text-slate-400">
            {searchTerm || categoryFilter !== 'all'
              ? 'No items match your filters.'
              : 'No menu items yet. Click "New Item" to create the first one.'}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article
                className="flex h-full flex-col rounded-2xl border border-white/10 bg-sidebar/70 shadow-lg transition hover:border-primary/40 hover:shadow-primary/10 overflow-hidden"
                key={item.id}
              >
                <div className="flex flex-col h-full">
                  {/* Image container with aspect ratio */}
                  {item.imageUrl ? (
                    <div className="w-full aspect-[16/10] bg-surface/50 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
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
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-white line-clamp-2">{item.name}</h3>
                        <span
                          className={clsx(
                            'inline-flex items-center rounded-full px-2 sm:px-3 py-1 text-xs font-semibold whitespace-nowrap flex-shrink-0',
                            item.isAvailable
                              ? 'bg-emerald-500/10 text-emerald-200'
                              : 'bg-slate-600/20 text-slate-400',
                          )}
                        >
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded">
                          {item.categoryName}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                        {item.description || 'No description provided.'}
                      </p>

                      {item.dietaryInfo ? (
                        <div className="flex items-center gap-1">
                          <svg
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="text-xs text-slate-400">{item.dietaryInfo}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-primary/40 hover:bg-primary/10"
                        onClick={() => handleToggleAvailability(item)}
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
                            d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6 6h.008v.008H6V6z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="truncate">
                          {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                        </span>
                      </button>

                      <div className="flex gap-2">
                        <button
                          className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/5"
                          onClick={() => openEditForm(item)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="flex-1 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-200 transition hover:border-red-500/60 hover:bg-red-500/10"
                          onClick={() => handleDelete(item)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-sidebar/90 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {currentItem ? 'Edit Menu Item' : 'Create Menu Item'}
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
                <label className="block text-sm font-medium text-slate-300" htmlFor="item-category">
                  Category *
                </label>
                <select
                  className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  id="item-category"
                  name="categoryId"
                  onChange={handleFormChange('categoryId')}
                  value={form.categoryId}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {formErrors.categoryId ? (
                  <p className="mt-1 text-xs text-red-300">{formErrors.categoryId}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300" htmlFor="item-name">
                  Name *
                </label>
                <input
                  autoFocus
                  className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  id="item-name"
                  name="name"
                  onChange={handleFormChange('name')}
                  placeholder="e.g. Grilled Salmon"
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
                  htmlFor="item-description"
                >
                  Description
                </label>
                <textarea
                  className="mt-1 h-24 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  id="item-description"
                  name="description"
                  onChange={handleFormChange('description')}
                  placeholder="Brief description shown to guests"
                  value={form.description}
                />
                {formErrors.description ? (
                  <p className="mt-1 text-xs text-red-300">{formErrors.description}</p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300" htmlFor="item-price">
                    Price *
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      className="w-full rounded-lg border border-white/10 bg-surface pl-8 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      id="item-price"
                      name="price"
                      onChange={handleFormChange('price')}
                      placeholder="0.00"
                      step="0.01"
                      type="number"
                      value={form.price}
                    />
                  </div>
                  {formErrors.price ? (
                    <p className="mt-1 text-xs text-red-300">{formErrors.price}</p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300" htmlFor="item-dietary">
                    Dietary Info
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    id="item-dietary"
                    name="dietaryInfo"
                    onChange={handleFormChange('dietaryInfo')}
                    placeholder="e.g. Gluten-free, Vegan"
                    type="text"
                    value={form.dietaryInfo}
                  />
                  {formErrors.dietaryInfo ? (
                    <p className="mt-1 text-xs text-red-300">{formErrors.dietaryInfo}</p>
                  ) : null}
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-slate-300"
                  htmlFor="item-image"
                >
                  Item Image
                </label>
                <div className="mt-2 space-y-3">
                  {/* Show current image if editing and has image */}
                  {currentItem?.imageUrl && !form.imageFile ? (
                    <div className="relative">
                      <img
                        src={currentItem.imageUrl}
                        alt="Current item"
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
                    id="item-image"
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

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
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
                    : currentItem
                      ? 'Update Item'
                      : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default MenuItemsView
