'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface SearchResult {
  id: string
  type: 'thread' | 'user' | 'course'
  title: string
  content?: string
  author?: string
  course?: string
  university?: string
  faculty?: string
  createdAt?: string
  commentCount?: number
  likeCount?: number
}

// Future interfaces for new sections
/*
interface Course {
  id: string
  name: string
  professor: string
  university: string
  faculty: string
  department: string
  credits: number
  difficulty: number // 1-5
  workload: number // 1-5
  overall: number // 1-5
  reviewCount: number
  isEasy: boolean
  tags: string[]
  description?: string
}

interface PastExam {
  id: string
  courseName: string
  professor: string
  year: number
  semester: 'spring' | 'fall' | 'summer'
  examType: 'midterm' | 'final' | 'quiz' | 'assignment'
  university: string
  faculty: string
  department: string
  uploadedBy: string
  uploadedAt: string
  downloadCount: number
  difficulty: number
  helpful: number
  tags: string[]
}

interface LivePost {
  id: string
  content: string
  author: string
  university: string
  faculty: string
  department: string
  course?: string
  urgency: 'low' | 'medium' | 'high'
  type: 'test_info' | 'attendance' | 'homework' | 'general'
  createdAt: string
  likes: number
  replies: number
  isAnonymous: boolean
}
*/

type MainSection = 'search' | 'exams'

const mockResults: SearchResult[] = [
  {
    id: '1',
    type: 'thread',
    title: 'マクロ経済学 2024年期末試験について',
    content: '来週のマクロ経済学の期末試験、過去問と傾向が似てるかな？IS-LMモデルは確実に出そうだけど...',
    author: '経済3年',
    course: 'マクロ経済学',
    university: '東京大学',
    faculty: '経済学部',
    createdAt: '2024-01-15',
    commentCount: 12,
    likeCount: 8
  },
  {
    id: '2',
    type: 'user',
    title: '田中教授',
    university: '早稲田大学',
    faculty: '商学部'
  },
  {
    id: '3',
    type: 'course',
    title: 'データ構造とアルゴリズム',
    university: '東京工業大学',
    faculty: '情報理工学院'
  }
]

// Mock data for future implementation
// const mockCourses: Course[] = []
// const mockPastExams: PastExam[] = []
// const mockLivePosts: LivePost[] = []

const mockTrendingTopics = [
  { name: 'マクロ経済学', count: 234, category: '経済' },
  { name: '線形代数', count: 187, category: '数学' },
  { name: '有機化学', count: 156, category: '化学' },
  { name: 'データベース', count: 143, category: '情報' },
  { name: '国際関係論', count: 132, category: '政治' },
  { name: '心理学概論', count: 118, category: '心理' },
  { name: '機械学習', count: 109, category: '情報' },
  { name: '日本史', count: 98, category: '歴史' },
  { name: '憲法', count: 87, category: '法学' },
  { name: '統計学', count: 76, category: '統計' }
]

interface UserInfo {
  university: string
  faculty: string
  department: string
  year: string
  penName: string
  isLoggedIn: boolean
  completedAt: string
}

function SearchPageClient() {
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState<MainSection>('exams')
  const [query, setQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState<'all' | 'threads' | 'users' | 'courses'>('all')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      handleSearch(q)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    // Load user information from localStorage
    const savedUserInfo = localStorage.getItem('kakomonn_user')
    if (savedUserInfo) {
      try {
        const parsed = JSON.parse(savedUserInfo)
        setUserInfo(parsed)
      } catch (error) {
        console.error('Failed to parse user info:', error)
      }
    }
  }, [])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      let filtered = mockResults.filter(result => 
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.course?.toLowerCase().includes(searchQuery.toLowerCase())
      )

      // Prioritize results from user's university if logged in
      if (userInfo) {
        filtered = filtered.sort((a, b) => {
          const aMatchesUniversity = a.university === userInfo.university
          const bMatchesUniversity = b.university === userInfo.university
          const aMatchesFaculty = a.faculty === userInfo.faculty
          const bMatchesFaculty = b.faculty === userInfo.faculty

          // Same university results first
          if (aMatchesUniversity && !bMatchesUniversity) return -1
          if (!aMatchesUniversity && bMatchesUniversity) return 1
          
          // Within same university, prioritize same faculty
          if (aMatchesUniversity && bMatchesUniversity) {
            if (aMatchesFaculty && !bMatchesFaculty) return -1
            if (!aMatchesFaculty && bMatchesFaculty) return 1
          }

          return 0
        })
      }

      setResults(filtered)
      setIsLoading(false)
    }, 500)
  }

  const getTabResults = () => {
    if (selectedTab === 'all') return results
    return results.filter(result => {
      if (selectedTab === 'threads') return result.type === 'thread'
      if (selectedTab === 'users') return result.type === 'user'
      if (selectedTab === 'courses') return result.type === 'course'
      return true
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            KakoMoNN
          </Link>
          <div className="flex items-center space-x-4">
            {userInfo && (
              <Link href="/profile">
                <div className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors cursor-pointer">
                  👤 {userInfo.penName || '匿名ユーザー'} ({userInfo.university})
                </div>
              </Link>
            )}
            <div className="text-sm text-gray-500">
              {query && activeSection === 'search' && `"${query}" の検索結果`}
            </div>
          </div>
        </div>

        {/* Main Value Proposition */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-6 px-8 rounded-2xl shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-2">📝 過去問データベース</h2>
            <p className="text-lg opacity-90">大学の過去問を検索・共有・分析できるプラットフォーム</p>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
              {[
                { key: 'exams', label: '📝 過去問検索', desc: 'メイン機能' },
                { key: 'search', label: '🔍 統合検索', desc: 'その他の検索' }
              ].map(section => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key as MainSection)}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === section.key
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-base">{section.label}</div>
                    <div className="text-xs opacity-80">{section.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Personalized Welcome Message */}
        {userInfo && !query && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">
              こんにちは、{userInfo.penName || '匿名ユーザー'}さん！
            </h3>
            <p className="text-indigo-700 text-sm">
              {userInfo.university} {userInfo.faculty} {userInfo.department} {userInfo.year}の情報を優先的に表示します。
            </p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                placeholder={
                  activeSection === 'exams' ? "科目名、大学名、年度で過去問を検索..." :
                  "過去問、授業、教授を検索..."
                }
                className="w-full px-4 py-4 pl-12 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Sample searches based on active section */}
            <div className="mt-3">
              <div className="text-sm text-gray-500 mb-2">
                {activeSection === 'exams' ? '人気の過去問: ' : '人気の検索: '}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {activeSection === 'exams' ? [
                  '線形代数 2024', '有機化学 期末', 'マクロ経済学', 'データ構造'
                ].map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term)
                      handleSearch(term)
                    }}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm transition-colors"
                  >
                    {term}
                  </button>
                )) : [
                  '線形代数', 'マクロ経済学', '有機化学', 'プログラミング基礎'
                ].map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term)
                      handleSearch(term)
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-full text-sm transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center mt-4">
              <button
                onClick={() => handleSearch(query)}
                disabled={isLoading}
                className="px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? '検索中...' : '検索'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Section */}
            {activeSection === 'search' && query && (
              <>
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                  {[
                    { key: 'all', label: 'すべて', count: results.length },
                    { key: 'threads', label: 'スレッド', count: results.filter(r => r.type === 'thread').length },
                    { key: 'users', label: 'ユーザー', count: results.filter(r => r.type === 'user').length },
                    { key: 'courses', label: '授業', count: results.filter(r => r.type === 'course').length }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedTab(tab.key as any)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        selectedTab === tab.key
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>

                {/* Results */}
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">検索中...</p>
                    </div>
                  ) : getTabResults().length > 0 ? (
                    getTabResults().map(result => (
                      <div key={result.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                result.type === 'thread' ? 'bg-blue-100 text-blue-700' :
                                result.type === 'user' ? 'bg-green-100 text-green-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {result.type === 'thread' ? 'スレッド' :
                                 result.type === 'user' ? 'ユーザー' : '授業'}
                              </span>
                              
                              {/* University match indicator */}
                              {userInfo && result.university === userInfo.university && (
                                <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium">
                                  🏫 同じ大学
                                </span>
                              )}
                              
                              {/* Faculty match indicator */}
                              {userInfo && result.university === userInfo.university && result.faculty === userInfo.faculty && (
                                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">
                                  📚 同じ学部
                                </span>
                              )}

                              {result.university && (
                                <span className={`text-sm ${
                                  userInfo && result.university === userInfo.university 
                                    ? 'text-indigo-600 font-medium' 
                                    : 'text-gray-500'
                                }`}>
                                  {result.university}
                                </span>
                              )}
                              {result.faculty && (
                                <span className={`text-sm ${
                                  userInfo && result.faculty === userInfo.faculty 
                                    ? 'text-purple-600 font-medium' 
                                    : 'text-gray-500'
                                }`}>
                                  • {result.faculty}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              <Link href={result.type === 'thread' ? `/threads/${result.id}` : '#'} className="hover:text-indigo-600 transition-colors">
                                {result.title}
                              </Link>
                            </h3>
                            {result.content && (
                              <p className="text-gray-600 mb-3 line-clamp-2">{result.content}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {result.author && <span>投稿者: {result.author}</span>}
                              {result.course && <span>授業: {result.course}</span>}
                              {result.createdAt && <span>{result.createdAt}</span>}
                              {result.commentCount !== undefined && (
                                <span>💬 {result.commentCount}</span>
                              )}
                              {result.likeCount !== undefined && (
                                <span>❤️ {result.likeCount}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">検索結果が見つかりませんでした。</p>
                      <p className="text-sm text-gray-500 mt-1">別のキーワードで検索してみてください。</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeSection === 'search' && !query && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">何をお探しですか？</h2>
                <p className="text-gray-600 mb-8">過去問、授業情報、教授について検索できます</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
                  <button 
                    onClick={() => {
                      setQuery('線形代数')
                      handleSearch('線形代数')
                    }}
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all group cursor-pointer"
                  >
                    <div className="text-indigo-600 text-3xl mb-4 group-hover:scale-110 transition-transform">📝</div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600">過去問・試験情報</h3>
                    <p className="text-sm text-gray-600">過去の試験問題や傾向を検索</p>
                    <div className="mt-2 text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      クリックして試してみる →
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      setQuery('マクロ経済学')
                      handleSearch('マクロ経済学')
                    }}
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all group cursor-pointer"
                  >
                    <div className="text-purple-600 text-3xl mb-4 group-hover:scale-110 transition-transform">📚</div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600">授業・講義情報</h3>
                    <p className="text-sm text-gray-600">授業の内容や評価を検索</p>
                    <div className="mt-2 text-xs text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      クリックして試してみる →
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      setQuery('田中教授')
                      handleSearch('田中教授')
                    }}
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-green-300 transition-all group cursor-pointer"
                  >
                    <div className="text-green-600 text-3xl mb-4 group-hover:scale-110 transition-transform">👨‍🏫</div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600">教授・講師情報</h3>
                    <p className="text-sm text-gray-600">教授の授業スタイルや評価を検索</p>
                    <div className="mt-2 text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      クリックして試してみる →
                    </div>
                  </button>
                </div>
                
                {/* Quick action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="text-sm text-gray-500">メイン機能を試してみよう:</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveSection('exams')}
                      className="px-6 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border-2 border-blue-200"
                    >
                      📝 過去問データベースを見る
                    </button>
                    <button
                      onClick={() => {
                        setQuery('線形代数 2024')
                        handleSearch('線形代数 2024')
                      }}
                      className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                    >
                      🔍 サンプル検索を試す
                    </button>
                  </div>
                </div>
              </div>
            )}


            {/* Past Exams Section */}
            {activeSection === 'exams' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <div className="text-indigo-600 text-6xl mb-6">📝</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">過去問データベース</h2>
                  <p className="text-gray-600 mb-8">年度別・学期別に整理された過去問をチェック</p>
                  
                  {/* Past Exam Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                      <div className="text-blue-600 text-3xl mb-4">📅</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">年度別検索</h3>
                      <p className="text-gray-600 text-sm mb-4">2020年〜2024年の過去問を年度別に検索</p>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>2024年</span>
                          <span className="text-blue-600 font-medium">234件</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>2023年</span>
                          <span className="text-blue-600 font-medium">189件</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100">
                      <div className="text-orange-600 text-3xl mb-4">📊</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">出題傾向</h3>
                      <p className="text-gray-600 text-sm mb-4">過去3年間の出題傾向を分析</p>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>計算問題</span>
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div className="bg-orange-500 h-2 rounded-full" style={{width: '80%'}}></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>論述問題</span>
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div className="bg-orange-500 h-2 rounded-full" style={{width: '60%'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                      <div className="text-green-600 text-3xl mb-4">✅</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">解答・解説</h3>
                      <p className="text-gray-600 text-sm mb-4">詳細な解答と先輩からのアドバイス</p>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center mb-1">
                            <span className="text-green-600">✓</span>
                            <span className="ml-2">解答付き: 156件</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-blue-600">💡</span>
                            <span className="ml-2">解説付き: 89件</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-600">⚠️</span>
                        <span className="text-sm text-yellow-800 font-medium">このセクションは開発中です</span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">過去問データベースと分析機能を準備中です！</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button 
                        onClick={() => setActiveSection('search')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                      >
                        🔍 統合検索に戻る
                      </button>
                      <button 
                        onClick={() => {
                          setQuery('線形代数 2024')
                          handleSearch('線形代数 2024')
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                      >
                        📝 サンプル過去問を見る
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* User Profile Section */}
            {userInfo && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">プロフィール</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">表示名:</span>
                    <span className="font-medium">{userInfo.penName || '匿名ユーザー'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">大学:</span>
                    <span className="font-medium">{userInfo.university}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">学部:</span>
                    <span className="font-medium">{userInfo.faculty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">学科:</span>
                    <span className="font-medium">{userInfo.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">学年:</span>
                    <span className="font-medium">{userInfo.year}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {userInfo ? `${userInfo.university}で人気のトピック` : '人気のトピック'}
              </h3>
              <div className="space-y-3">
                {mockTrendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <button 
                      onClick={() => {
                        setQuery(topic.name)
                        handleSearch(topic.name)
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium text-left"
                    >
                      {topic.name}
                    </button>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {topic.category}
                      </span>
                      <span className="text-xs text-gray-500">{topic.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">検索のコツ</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• 具体的な授業名を入力してみましょう</p>
                <p>• 大学名と組み合わせると絞り込めます</p>
                <p>• 教授の名前でも検索できます</p>
                <p>• 「過去問」「試験」などのキーワードも有効です</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <SearchPageClient />
    </Suspense>
  )
}