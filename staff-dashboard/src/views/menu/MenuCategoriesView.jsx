import clsx from 'clsx'
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
    statusFilter,
    setStatusFilter,
    reload,
  } = useMenuCategoriesViewModel()

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
                : 'No categories yet. Click “New Category” to create the first one.'}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <article
                className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-sidebar/70 p-5 shadow-lg transition hover:border-primary/40 hover:shadow-primary/10"
                key={category.id}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                    <span
                      className={clsx(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                        category.isActive
                          ? 'bg-emerald-500/10 text-emerald-200'
                          : 'bg-slate-600/20 text-slate-400',
                      )}
                    >
                      {category.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">
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

                  {category.imageUrl ? (
                    <a
                      className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
                      href={category.imageUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View image
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-primary/40 hover:bg-primary/10"
                    onClick={() => handleToggleVisibility(category)}
                    type="button"
                  >
                    <svg
                      className="h-4 w-4"
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
                    {category.isActive ? 'Hide from customers' : 'Show to customers'}
                  </button>

                  <div className="flex gap-2">
                    <button
                      className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/5"
                      onClick={() => openEditForm(category)}
                      type="button"
                    >
                      Edit details
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
              </article>
            ))}
          </div>
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
                  htmlFor="category-image-url"
                >
                  Image URL
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  id="category-image-url"
                  name="imageUrl"
                  onChange={handleFormChange('imageUrl')}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                  value={form.imageUrl}
                />
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
