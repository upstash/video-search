"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { apiClient } from "@/utils/client";
import { Input, List, Spin } from "antd";
import { Captions } from "lucide-react";
import { formatSecondsToTime, FormattedDocument } from "@/utils/data-formatter";

export default function SearchUI({
  videoId,
  setSelectedMoment,
}: {
  videoId: string;
  setSelectedMoment: (moment: string) => void;
}) {
  const [results, setResults] = useState<FormattedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchId = useRef(0);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      searchId.current += 1;
      const currentSearchId = searchId.current;

      if (!searchQuery) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await apiClient.searchVideo(videoId, searchQuery);
        if (currentSearchId === searchId.current) {
          setResults(response.results as FormattedDocument[]);
        }
      } catch (error) {
        console.error("Search error:", error);
        if (currentSearchId === searchId.current) {
          setResults([]);
        }
      } finally {
        if (currentSearchId === searchId.current) {
          setLoading(false);
        }
      }
    },
    [videoId]
  );

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (newQuery) {
      debounceTimeout.current = setTimeout(() => {
        handleSearch(newQuery);
      }, 300);
    } else {
      searchId.current += 1;
      setResults([]);
      setLoading(false);
    }
  };

  const onSearch = (value: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    handleSearch(value);
  };

  return (
    <div className="max-w-sm mt-12 mx-auto">
      <Input
        size="middle"
        placeholder="Search moments..."
        onChange={handleQueryChange}
        onPressEnter={(e) => onSearch(e.currentTarget.value)}
        value={query}
        suffix={loading ? <Spin size="small" /> : <span />}
      />
      <List
        className="mt-4"
        itemLayout="horizontal"
        dataSource={results}
        renderItem={(item) => (
          <List.Item
            onClick={() => {
              setSelectedMoment(item.metadata?.start_time.toString() ?? "0");
            }}
            className="cursor-pointer hover:bg-gray-100"
          >
            <List.Item.Meta
              avatar={<Captions />}
              title={`"${item.content.text.trim()}"`}
              description={formatSecondsToTime(item.metadata?.start_time ?? 0)}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
