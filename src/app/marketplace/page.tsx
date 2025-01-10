"use client";

// Import necessary React and Next.js components
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

// Utility functions for NFT marketplace interactions
import { getNFTDetail, getNFTList } from "@/utils/nftMarket";

// Reusable UI components
import Card from "@/components/Card";
import Skeleton from "@/components/Skeleton";

// TypeScript interface for NFT details
export interface NFTDetail {
  name: string;
  symbol: string;
  image?: string;
  group?: string;
  mint: string;
  seller: string;
  price: string;
  listing: string;
  collection: string;
}

// Function to shorten cryptocurrency addresses for display
const trimAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

// Main component definition
const Closet: React.FC = () => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [assets, setAssets] = useState<NFTDetail[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<NFTDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    collection: "",
    minPrice: 0,
    maxPrice: 1000,
    category: "",
  });

  // Fetch NFTs when wallet or connection changes
  useEffect(() => {
    const fetchNFTs = async () => {
      if (!wallet || !connection) return;

      setIsLoading(true);
      const provider = new AnchorProvider(connection, wallet as Wallet, {});
      try {
        const listings = await getNFTList(provider, connection);
        const promises = listings
          .filter(list => list.isActive)
          .map(list => getNFTDetail(
            new PublicKey(list.mint),
            connection,
            list.seller,
            list.price,
            list.pubkey
          ));

        const detailedListings = await Promise.all(promises);
        setAssets(detailedListings);
        setFilteredAssets(detailedListings);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [wallet, connection]);

  // Apply filters to the list of NFTs
  useEffect(() => {
    applyFilters();
  }, [assets, filters]);

  // Handle changes to filter inputs
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Function to apply filters based on user input
  const applyFilters = () => {
    const filtered = assets.filter(asset => {
      const price = parseFloat(asset.price) / 1e6; // Normalize price for comparison
      return (
        (filters.collection === '' || (asset.collection && asset.collection.toLowerCase().includes(filters.collection.toLowerCase()))) &&
        (filters.category === '' || asset.category === filters.category) &&
        price >= filters.minPrice &&
        price <= filters.maxPrice
      );
    });
    setFilteredAssets(filtered);
  };

  // Render the component
  return (
    <div className="p-4 pt-20 bg-white dark:bg-black min-h-screen flex">
      <div className="w-1/4 p-4 bg-gray-200 rounded-lg">
        {/* Filters section */}
        <h2 className="text-xl font-semibold text-center mb-4">Filters</h2>
        <div className="mb-4">
          <label className="block text-sm">Collection</label>
          <input
            type="text"
            name="collection"
            value={filters.collection}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
            placeholder="Search by collection"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Price Range (SOL)</label>
          <div className="flex justify-between">
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="w-1/2 p-2 border rounded"
              placeholder="Min Price"
            />
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-1/2 p-2 border rounded"
              placeholder="Max Price"
            />
          </div>
        </div>
      </div>

      <div className="w-3/4 p-4">
        {/* Display NFTs or loading state */}
        <h1 className="text-3xl font-bold mb-4 text-center text-black dark:text-white">NFTs on sale</h1>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index}>
                <Skeleton className="h-64 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAssets.map((asset: NFTDetail) => (
              <div
                key={asset.mint}
                className="relative p-4 border rounded shadow hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer bg-white dark:bg-black group"
              >
                <Link href={`/marketplace/${asset.mint}`}>
                  <div className="relative h-64 w-full mb-4">
                    {asset.image ? (
                      <Image
                        src={asset.image}
                        alt={`Asset ${asset.mint}`}
                        layout="fill"
                        objectFit="contain"
                        className="rounded"
                      />
                    ) : (
                      <p>No Image Available</p>
                    )}
                  </div>
                </Link>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity flex flex-col justify-end items-center opacity-0 group-hover:opacity-100 text-white text-xs p-2">
                  <p className="font-semibold">{asset.name || "Unknown"}</p>
                  <Link
                    href={`https://solana.fm/address/${asset.mint}`}
                    target="_blank"
                    className="hover:text-gray-300 flex items-center"
                  >
                    {trimAddress(asset.mint)} <FaExternalLinkAlt className="ml-1" />
                  </Link>
                  {asset.group && (
                    <Link
                      href={`https://solana.fm/address/${asset.group}`}
                      target="_blank"
                      className="hover:text-gray-300 flex items-center"
                    >
                      Group: {trimAddress(asset.group)} <FaExternalLinkAlt className="ml-1" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <h2 className="text-2xl font-bold mb-4 text-center text-red-500 dark:text-yellow">No NFTs on sale</h2>
        )}
      </div>
    </div>
  );
};

export default Closet;
