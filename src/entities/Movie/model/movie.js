import { 
    defineStore, 
} from 'pinia'
import {
    ref,
} from 'vue'
import {
    CINEMA_NAMES,
} from '@/shared/lib/constants'

export const useMovieStore = defineStore('movie', () => {
    const films = ref([])
    const series = ref([])
    const selectedMovieDetails = ref(null)
    const filmsLoaded = ref(false)
    const seriesLoaded = ref(false)
    const totalPages = ref({ [CINEMA_NAMES.FILM]: 0, [CINEMA_NAMES.TV_SERIES]: 0 })

    const fetchDataByCategory = async (category, page = 1) => {
        try {
            const res = await fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films?type=${category}&page=${page}`, {
                method: 'GET',
                headers: {
                    'X-API-KEY': import.meta.env.VITE_API_KEY,
                    'Content-Type': 'application/json',
                },
            })

            if (!res.ok) {
                throw new Error(`Ошибка при загрузке ${category}: ${res.statusText}`)
            }

            const data = await res.json()

            const categoryMapping = {
                [CINEMA_NAMES.FILM]: { data: films, loaded: filmsLoaded },
                [CINEMA_NAMES.TV_SERIES]: { data: series, loaded: seriesLoaded },
            }
  
            const { data: categoryData, loaded } = categoryMapping[category] || {}
  
            if (categoryData && loaded) {
                if (page === 1) {
                    categoryData.value = data.items
                } else {
                    categoryData.value = [...categoryData.value, ...data.items]
                }
                totalPages.value[category] = data.totalPages
                loaded.value = true
            }
        } catch (error) {
            console.error(`Ошибка при загрузке ${category}:`, error)
        }
    }

    // const fetchNextPage = async (category) => {
    //     try {
    //         if (currentPage.value[category] <= totalPages.value[category]) {
    //             await fetchDataByCategory(category, currentPage.value[category])
    //             currentPage.value[category]++
    //         }
    //     } catch (error) {
    //         console.error(`Ошибка при загрузке следующей страницы ${category}:`, error)
    //     } finally {
    //         isLoading.value = false
    //     }
    // }

    // const resetPagination = (category) => {
    //     currentPage.value[category] = 1
    //     if (category === CINEMA_NAMES.FILM) {
    //         films.value = []
    //     } else if (category === CINEMA_NAMES.TV_SERIES) {
    //         series.value = []
    //     }
    // }

    // const initialFetch = async (category) => {
    //     resetPagination(category)
    //     await fetchNextPage(category)
    // }

    const fetchAllPages = async (category, page) => {
        await fetchDataByCategory(category, page)
        const promises = []
        for (let i = 2; i <= totalPages.value[category]; i++) {
            promises.push(fetchDataByCategory(category, i))
        }
        await Promise.all(promises)
    }

    const fetchAllCategories = async () => {
        const promises = []

        if (!filmsLoaded.value) {
            promises.push(fetchDataByCategory(CINEMA_NAMES.FILM))
        }

        if (!seriesLoaded.value) {
            promises.push(fetchDataByCategory(CINEMA_NAMES.TV_SERIES))
        }

        await Promise.all(promises)
    }

    const fetchMovieDetails = async (id) => {
        try {
            const res = await fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/${id}`, {
                method: 'GET',
                headers: {
                    'X-API-KEY': import.meta.env.VITE_API_KEY,
                    'Content-Type': 'application/json',
                },
            })
	
            selectedMovieDetails.value = await res.json()
	
            console.log('selectedMovie.value', selectedMovieDetails.value)
        } catch (error) {
            console.error('Error fetching movie details:', error)
        }
    }

    return {
        films,
        series,
        // fetchNextPage,
        // initialFetch,
        // resetPagination,
        fetchAllPages,
        fetchAllCategories,
        fetchDataByCategory,
        fetchMovieDetails,
        selectedMovieDetails,
    }

})