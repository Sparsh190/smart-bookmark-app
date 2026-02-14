'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('bookmarks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks' },
        () => {
          fetchBookmarks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
      await fetchBookmarks()
      setLoading(false)
    }
  }

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBookmarks(data)
    }
  }

  const addBookmark = async () => {
    if (!title || !url) return

    await supabase.from('bookmarks').insert({
      title,
      url,
      user_id: user.id
    })

    setTitle('')
    setUrl('')
  }

  const deleteBookmark = async (id: string) => {
    await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Smart Bookmarks</h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Bookmark Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Bookmarks</h2>

          {/* Add Form */}
          <div className="mb-6 space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="border p-2 w-full rounded"
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL"
              className="border p-2 w-full rounded"
            />
            <button
              onClick={addBookmark}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Bookmark
            </button>
          </div>

          {/* Bookmark List */}
          <div className="space-y-3">
            {bookmarks.length === 0 && (
              <p className="text-gray-500">No bookmarks yet.</p>
            )}

            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="flex justify-between items-center border p-3 rounded"
              >
                <div>
                  <p className="font-semibold">{bookmark.title}</p>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    className="text-blue-500 text-sm"
                  >
                    {bookmark.url}
                  </a>
                </div>
                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}