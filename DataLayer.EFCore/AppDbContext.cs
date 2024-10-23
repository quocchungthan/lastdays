using Business.Domain;
using Microsoft.EntityFrameworkCore;

namespace DataLayer.EFCore
{
	public class AppDbContext : DbContext
	{
		public DbSet<User> Users { get; set; }

		public DbSet<EventLog> Events { get; set; }

		public DbSet<Board> Boards { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{

		}
	}
}
