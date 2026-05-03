import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export default async function MasterDataPage() {
  const session = await getSession()
  if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const [villages, companies, customers, suppliers, products] = await Promise.all([
    prisma.village.findMany({ orderBy: { name: 'asc' } }),
    prisma.company.findMany({ orderBy: { name: 'asc' } }),
    prisma.customer.findMany({ orderBy: { name: 'asc' } }),
    prisma.supplier.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
  ])

  function SimpleTable({ data, cols }: { data: Record<string, unknown>[]; cols: { key: string; label: string }[] }) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              {cols.map((c) => (
                <th key={c.key} className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-zinc-50">
                {cols.map((c) => (
                  <td key={c.key} className="px-4 py-2.5">
                    {c.key === 'isActive' ? (
                      <Badge variant={row[c.key] ? 'success' : 'destructive'} className="text-xs">
                        {row[c.key] ? 'Active' : 'Inactive'}
                      </Badge>
                    ) : (
                      <span className="text-sm">{String(row[c.key] ?? '—')}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={cols.length} className="text-center py-6 text-zinc-400 text-sm">No records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-zinc-500" />
        <h1 className="text-xl font-bold text-zinc-900">Master Data</h1>
      </div>
      <Tabs defaultValue="villages">
        <TabsList>
          <TabsTrigger value="villages">Villages ({villages.length})</TabsTrigger>
          <TabsTrigger value="companies">Companies ({companies.length})</TabsTrigger>
          <TabsTrigger value="customers">Customers ({customers.length})</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers ({suppliers.length})</TabsTrigger>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="villages">
          <SimpleTable data={villages} cols={[
            { key: 'name', label: 'Village' },
            { key: 'distanceKm', label: 'Distance (km)' },
            { key: 'isActive', label: 'Status' },
          ]} />
        </TabsContent>
        <TabsContent value="companies">
          <SimpleTable data={companies} cols={[
            { key: 'name', label: 'Company' },
            { key: 'type', label: 'Type' },
            { key: 'contact', label: 'Contact' },
            { key: 'isActive', label: 'Status' },
          ]} />
        </TabsContent>
        <TabsContent value="customers">
          <SimpleTable data={customers} cols={[
            { key: 'name', label: 'Customer' },
            { key: 'type', label: 'Type' },
            { key: 'contact', label: 'Contact' },
            { key: 'isActive', label: 'Status' },
          ]} />
        </TabsContent>
        <TabsContent value="suppliers">
          <SimpleTable
            data={suppliers.map((s) => ({
              ...s,
              materialTypes: JSON.parse(s.materialTypes).join(', '),
            }))}
            cols={[
              { key: 'name', label: 'Supplier' },
              { key: 'materialTypes', label: 'Materials' },
              { key: 'contact', label: 'Contact' },
              { key: 'isActive', label: 'Status' },
            ]}
          />
        </TabsContent>
        <TabsContent value="products">
          <SimpleTable data={products} cols={[
            { key: 'name', label: 'Product' },
            { key: 'module', label: 'Module' },
            { key: 'type', label: 'Type' },
            { key: 'defaultPrice', label: 'Default Price' },
            { key: 'unit', label: 'Unit' },
          ]} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
