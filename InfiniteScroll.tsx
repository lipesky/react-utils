import { Box, CircularProgress } from '@mui/material';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';



interface InfiniteScrollProps {
  initialCount?: number; 
  fetchMoreItems: (index: number) => Promise<void>;
  style?: CSSProperties,
}

const LoadingMore = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem', }}>
      <CircularProgress />
    </div>
  );
}

const InfiniteScrollComponent = (props: React.PropsWithChildren<InfiniteScrollProps>) => {

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentLoadingCount, setCurrentLoadingCount] = useState<number>(props.initialCount ?? 1);

  const incrementCurrentLoadingCount = () =>{
    setCurrentLoadingCount(prev =>prev + 1);
  }

  const scrollListener = (event: Event) => {
    let el = (event.target! as HTMLDivElement);
    const scrolledToBottom = el.scrollHeight - el.scrollTop <= el.offsetHeight;

    if (scrolledToBottom && !loading) {
      setLoading(true);
      props.fetchMoreItems(currentLoadingCount).then(() => {
        incrementCurrentLoadingCount();
        setTimeout(
          () => setLoading(false),
          100,
        )
      });
    }
  }

  useEffect(
    () => {
      // Scroll listener
      if (containerRef.current) {
        containerRef.current.addEventListener('scroll', scrollListener);
      }
      return () => {
        // remove scroll listeners
        if (containerRef.current) {
          containerRef.current.removeEventListener('scroll', scrollListener);
        }
      };
    },
    [loading, currentLoadingCount]
  );

  return (
    <Box
      ref={containerRef}
      style={{
        overflowX: 'hidden',
        overflowY: 'auto',
        height: '100%',
        flexGrow: 1,
        scrollbarWidth: 'thin',
        scrollbarColor: '#888 #f1f1f1',
        ...props.style,
      }}
    >
      {props.children}
      {loading && <LoadingMore />}
    </Box>
  );
}

export default InfiniteScrollComponent;