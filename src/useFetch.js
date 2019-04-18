import { useEffect, useLayoutEffect, useState, useCallback } from 'react'
// import isJSON from './isJSON'

export function useFetch(url, initialOptions) {
  if (!url) throw Error('The URL argument is required')
  // if on server, return loading
  if (!global.window) return Object.assign([null, true, null], { data: null, loading: true, error: null })

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [controller, setController] = useState(null) // Abortable Controller

  // const isMounted = useRef(false);
  // useLayoutEffect(() => {
  //   isMounted.current = true;
  //   return () => {
  //     isMounted.current = false;
  //   };
  // }, []);

  const fetchData = useCallback(async () => {
    if (controller !== null) {
      controller.abort()
    }

    let options = initialOptions
    if ('AbortController' in window) {
      const newController = new AbortController()
      setController(newController)
      options = {
        ...initialOptions,
        signal: newController.signal
      }
    }

    try {
      const response = await fetch(url, options)
      // const contentType =  response.headers.get('content-type')
      let data = null
      // if (contentType && isJSON(contentType)) {
      //   data = await response.json()
      // } else {
      //   data = await response.text()
      // }
      try {
        data = await response.json()
      } finally {}

      if (!data) {
        try {
          data = await response.text()
        } catch (err) {
          error = 'Invalid response format. Not JSON or text.'
        }
      }

      setData(data)
      setLoading(false)
    } catch (err) {
      const errMsg = err.name !== 'AbortError' ? err : null
      setError(errMsg)
      setLoading(false)
    }
  }, [url, initialOptions])

  useEffect(() => {
    fetchData()

    return () => {
      if (controller !== null) {
        controller.abort()
      }
    }
  }, [fetchData])

  const abort = () => controller && controller.abort()

  return Object.assign(
    [ data, loading, error, abort, fetchData ],
    { data, loading, error, abort, refetch: fetchData }
  )
}

export default useFetch
