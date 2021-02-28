/**
 * A doubly linked list-based Least Recently Used (LRU) cache. Will keep most
 * recently used items while discarding least recently used items when its limit
 * is reached.
 *
 * Licensed under MIT. Copyright (c) 2010 Rasmus Andersson <http://hunch.se/>
 * See README.md for details.
 *
 * Illustration of the design:
 *
 *       entry             entry             entry             entry
 *       ______            ______            ______            ______
 *      | head |.newer => |      |.newer => |      |.newer => | tail |
 *      |  A   |          |  B   |          |  C   |          |  D   |
 *      |______| <= older.|______| <= older.|______| <= older.|______|
 *
 *  removed  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  added
 */
var NEWER = Symbol('newer');
var OLDER = Symbol('older');
var Entry = /** @class */ (function () {
    function Entry(key, value) {
        this.key = key;
        this.value = value;
    }
    return Entry;
}());
export { Entry };
var LRUMap = /** @class */ (function () {
    function LRUMap(limit, entries) {
        this.limit = limit;
        this.size = 0;
        this._keymap = new Map();
        if (typeof limit !== 'number') {
            // called as (entries)
            entries = limit;
            limit = 0;
        }
        if (entries) {
            this.assign(entries);
            if (limit < 1) {
                this.limit = this.size;
            }
        }
    }
    LRUMap.prototype._markEntryAsUsed = function (entry) {
        if (entry === this.newest) {
            // Already the most recenlty used entry, so no need to update the list
            return;
        }
        // HEAD--------------TAIL
        //   <.older   .newer>
        //  <--- add direction --
        //   A  B  C  <D>  E
        if (entry[NEWER]) {
            if (entry === this.oldest) {
                this.oldest = entry[NEWER];
            }
            entry[NEWER][OLDER] = entry[OLDER]; // C <-- E.
        }
        if (entry[OLDER]) {
            entry[OLDER][NEWER] = entry[NEWER]; // C. --> E
        }
        entry[NEWER] = undefined; // D --x
        entry[OLDER] = this.newest; // D. --> E
        if (this.newest) {
            this.newest[NEWER] = entry; // E. <-- D
        }
        this.newest = entry;
    };
    LRUMap.prototype.assign = function (entries) {
        var entry;
        var limit = this.limit || Number.MAX_VALUE;
        this._keymap.clear();
        var it = entries[Symbol.iterator]();
        for (var itv = it.next(); !itv.done; itv = it.next()) {
            var e = new Entry(itv.value[0], itv.value[1]);
            this._keymap.set(e.key, e);
            if (!entry) {
                this.oldest = e;
            }
            else {
                entry[NEWER] = e;
                e[OLDER] = entry;
            }
            entry = e;
            if (limit-- === 0) {
                throw new Error('overflow');
            }
        }
        this.newest = entry;
        this.size = this._keymap.size;
    };
    LRUMap.prototype.get = function (key) {
        // First, find our cache entry
        var entry = this._keymap.get(key);
        if (!entry)
            return; // Not cached. Sorry.
        // As <key> was found in the cache, register it as being requested recently
        this._markEntryAsUsed(entry);
        return entry.value;
    };
    LRUMap.prototype.set = function (key, value) {
        var entry = this._keymap.get(key);
        if (entry) {
            // update existing
            entry.value = value;
            this._markEntryAsUsed(entry);
            return this;
        }
        // new entry
        this._keymap.set(key, (entry = new Entry(key, value)));
        if (this.newest) {
            // link previous tail to the new tail (entry)
            this.newest[NEWER] = entry;
            entry[OLDER] = this.newest;
        }
        else {
            // we're first in -- yay
            this.oldest = entry;
        }
        // add new entry to the end of the linked list -- it's now the freshest entry.
        this.newest = entry;
        ++this.size;
        if (this.size > this.limit) {
            // we hit the limit -- remove the head
            this.shift();
        }
        return this;
    };
    LRUMap.prototype.shift = function () {
        // todo: handle special case when limit == 1
        var entry = this.oldest;
        if (entry) {
            if (this.oldest[NEWER]) {
                // advance the list
                this.oldest = this.oldest[NEWER];
                this.oldest[OLDER] = undefined;
            }
            else {
                // the cache is exhausted
                this.oldest = undefined;
                this.newest = undefined;
            }
            // Remove last strong reference to <entry> and remove links from the purged
            // entry being returned:
            entry[NEWER] = entry[OLDER] = undefined;
            this._keymap.delete(entry.key);
            --this.size;
            return [entry.key, entry.value];
        }
    };
    return LRUMap;
}());
export { LRUMap };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibHJ1LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGNhcmRpaGFiL2FuZ3VsYXItZmhpci8iLCJzb3VyY2VzIjpbImxpYi9zZXJ2aWNlcy9scnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHO0FBR0QsSUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlCLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QjtJQUlFLGVBQW1CLEdBQUcsRUFBUyxLQUFLO1FBQWpCLFFBQUcsR0FBSCxHQUFHLENBQUE7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFBO0lBQUcsQ0FBQztJQUMxQyxZQUFDO0FBQUQsQ0FBQyxBQUxELElBS0M7O0FBRUQ7SUFNRSxnQkFBb0IsS0FBSyxFQUFFLE9BQVE7UUFBZixVQUFLLEdBQUwsS0FBSyxDQUFBO1FBTHpCLFNBQUksR0FBRyxDQUFDLENBQUM7UUFHVCxZQUFPLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUdsQixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtZQUM3QixzQkFBc0I7WUFDdEIsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNoQixLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQ1g7UUFHRCxJQUFJLE9BQU8sRUFBRTtZQUNYLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO2dCQUNiLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQzthQUN4QjtTQUNGO0lBQ0gsQ0FBQztJQUVELGlDQUFnQixHQUFoQixVQUFpQixLQUFLO1FBQ3BCLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDekIsc0VBQXNFO1lBQ3RFLE9BQU87U0FDUjtRQUNELHlCQUF5QjtRQUN6QixzQkFBc0I7UUFDdEIseUJBQXlCO1FBQ3pCLG9C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QUFLLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxTQUFTLENBQUM7YUFDaEM7aUJBQU07Z0JBQ0wseUJBQXlCO2dCQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7YUFDekI7WUFDRCwyRUFBMkU7WUFDM0Usd0JBQXdCO1lBQ3hCLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsU0FBUyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMvQixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDWixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDakM7SUFDSCxDQUFDO0lBQ0wsYUFBQztBQUFELENBQUMsQUF0SUMsSUFzSUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEEgZG91Ymx5IGxpbmtlZCBsaXN0LWJhc2VkIExlYXN0IFJlY2VudGx5IFVzZWQgKExSVSkgY2FjaGUuIFdpbGwga2VlcCBtb3N0XG4gKiByZWNlbnRseSB1c2VkIGl0ZW1zIHdoaWxlIGRpc2NhcmRpbmcgbGVhc3QgcmVjZW50bHkgdXNlZCBpdGVtcyB3aGVuIGl0cyBsaW1pdFxuICogaXMgcmVhY2hlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQuIENvcHlyaWdodCAoYykgMjAxMCBSYXNtdXMgQW5kZXJzc29uIDxodHRwOi8vaHVuY2guc2UvPlxuICogU2VlIFJFQURNRS5tZCBmb3IgZGV0YWlscy5cbiAqXG4gKiBJbGx1c3RyYXRpb24gb2YgdGhlIGRlc2lnbjpcbiAqXG4gKiAgICAgICBlbnRyeSAgICAgICAgICAgICBlbnRyeSAgICAgICAgICAgICBlbnRyeSAgICAgICAgICAgICBlbnRyeVxuICogICAgICAgX19fX19fICAgICAgICAgICAgX19fX19fICAgICAgICAgICAgX19fX19fICAgICAgICAgICAgX19fX19fXG4gKiAgICAgIHwgaGVhZCB8Lm5ld2VyID0+IHwgICAgICB8Lm5ld2VyID0+IHwgICAgICB8Lm5ld2VyID0+IHwgdGFpbCB8XG4gKiAgICAgIHwgIEEgICB8ICAgICAgICAgIHwgIEIgICB8ICAgICAgICAgIHwgIEMgICB8ICAgICAgICAgIHwgIEQgICB8XG4gKiAgICAgIHxfX19fX198IDw9IG9sZGVyLnxfX19fX198IDw9IG9sZGVyLnxfX19fX198IDw9IG9sZGVyLnxfX19fX198XG4gKlxuICogIHJlbW92ZWQgIDwtLSAgPC0tICA8LS0gIDwtLSAgPC0tICA8LS0gIDwtLSAgPC0tICA8LS0gIDwtLSAgPC0tICBhZGRlZFxuICovXG5cblxuICBjb25zdCBORVdFUiA9IFN5bWJvbCgnbmV3ZXInKTtcbiAgY29uc3QgT0xERVIgPSBTeW1ib2woJ29sZGVyJyk7XG4gIGV4cG9ydCBjbGFzcyBFbnRyeSB7XG4gICAgTkVXRVI7XG4gICAgT0xERVI7XG5cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMga2V5LCBwdWJsaWMgdmFsdWUpIHt9XG4gIH1cblxuICBleHBvcnQgY2xhc3MgTFJVTWFwIHtcbiAgICBzaXplID0gMDtcbiAgICBuZXdlc3Q7XG4gICAgb2xkZXN0O1xuICAgIF9rZXltYXAgPSBuZXcgTWFwKCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGxpbWl0LCBlbnRyaWVzPykge1xuICAgICAgaWYgKHR5cGVvZiBsaW1pdCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgLy8gY2FsbGVkIGFzIChlbnRyaWVzKVxuICAgICAgICBlbnRyaWVzID0gbGltaXQ7XG4gICAgICAgIGxpbWl0ID0gMDtcbiAgICAgIH1cblxuXG4gICAgICBpZiAoZW50cmllcykge1xuICAgICAgICB0aGlzLmFzc2lnbihlbnRyaWVzKTtcbiAgICAgICAgaWYgKGxpbWl0IDwgMSkge1xuICAgICAgICAgIHRoaXMubGltaXQgPSB0aGlzLnNpemU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBfbWFya0VudHJ5QXNVc2VkKGVudHJ5KSB7XG4gICAgICBpZiAoZW50cnkgPT09IHRoaXMubmV3ZXN0KSB7XG4gICAgICAgIC8vIEFscmVhZHkgdGhlIG1vc3QgcmVjZW5sdHkgdXNlZCBlbnRyeSwgc28gbm8gbmVlZCB0byB1cGRhdGUgdGhlIGxpc3RcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gSEVBRC0tLS0tLS0tLS0tLS0tVEFJTFxuICAgICAgLy8gICA8Lm9sZGVyICAgLm5ld2VyPlxuICAgICAgLy8gIDwtLS0gYWRkIGRpcmVjdGlvbiAtLVxuICAgICAgLy8gICBBICBCICBDICA8RD4gIEVcbiAgICAgIGlmIChlbnRyeVtORVdFUl0pIHtcbiAgICAgICAgaWYgKGVudHJ5ID09PSB0aGlzLm9sZGVzdCkge1xuICAgICAgICAgIHRoaXMub2xkZXN0ID0gZW50cnlbTkVXRVJdO1xuICAgICAgICB9XG4gICAgICAgIGVudHJ5W05FV0VSXVtPTERFUl0gPSBlbnRyeVtPTERFUl07IC8vIEMgPC0tIEUuXG4gICAgICB9XG4gICAgICBpZiAoZW50cnlbT0xERVJdKSB7XG4gICAgICAgIGVudHJ5W09MREVSXVtORVdFUl0gPSBlbnRyeVtORVdFUl07IC8vIEMuIC0tPiBFXG4gICAgICB9XG4gICAgICBlbnRyeVtORVdFUl0gPSB1bmRlZmluZWQ7IC8vIEQgLS14XG4gICAgICBlbnRyeVtPTERFUl0gPSB0aGlzLm5ld2VzdDsgLy8gRC4gLS0+IEVcbiAgICAgIGlmICh0aGlzLm5ld2VzdCkge1xuICAgICAgICB0aGlzLm5ld2VzdFtORVdFUl0gPSBlbnRyeTsgLy8gRS4gPC0tIERcbiAgICAgIH1cbiAgICAgIHRoaXMubmV3ZXN0ID0gZW50cnk7XG4gICAgfVxuXG4gICAgYXNzaWduKGVudHJpZXMpIHtcbiAgICAgIGxldCBlbnRyeTtcbiAgICAgIGxldCBsaW1pdCA9IHRoaXMubGltaXQgfHwgTnVtYmVyLk1BWF9WQUxVRTtcbiAgICAgIHRoaXMuX2tleW1hcC5jbGVhcigpO1xuICAgICAgY29uc3QgaXQgPSBlbnRyaWVzW1N5bWJvbC5pdGVyYXRvcl0oKTtcbiAgICAgIGZvciAobGV0IGl0diA9IGl0Lm5leHQoKTsgIWl0di5kb25lOyBpdHYgPSBpdC5uZXh0KCkpIHtcbiAgICAgICAgY29uc3QgZSA9IG5ldyBFbnRyeShpdHYudmFsdWVbMF0sIGl0di52YWx1ZVsxXSk7XG4gICAgICAgIHRoaXMuX2tleW1hcC5zZXQoZS5rZXksIGUpO1xuICAgICAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgICAgdGhpcy5vbGRlc3QgPSBlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVudHJ5W05FV0VSXSA9IGU7XG4gICAgICAgICAgZVtPTERFUl0gPSBlbnRyeTtcbiAgICAgICAgfVxuICAgICAgICBlbnRyeSA9IGU7XG4gICAgICAgIGlmIChsaW1pdC0tID09PSAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdvdmVyZmxvdycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLm5ld2VzdCA9IGVudHJ5O1xuICAgICAgdGhpcy5zaXplID0gdGhpcy5fa2V5bWFwLnNpemU7XG4gICAgfVxuXG4gICAgZ2V0KGtleSkge1xuICAgICAgLy8gRmlyc3QsIGZpbmQgb3VyIGNhY2hlIGVudHJ5XG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuX2tleW1hcC5nZXQoa2V5KTtcbiAgICAgIGlmICghZW50cnkpIHJldHVybjsgLy8gTm90IGNhY2hlZC4gU29ycnkuXG4gICAgICAvLyBBcyA8a2V5PiB3YXMgZm91bmQgaW4gdGhlIGNhY2hlLCByZWdpc3RlciBpdCBhcyBiZWluZyByZXF1ZXN0ZWQgcmVjZW50bHlcbiAgICAgIHRoaXMuX21hcmtFbnRyeUFzVXNlZChlbnRyeSk7XG4gICAgICByZXR1cm4gZW50cnkudmFsdWU7XG4gICAgfVxuXG4gICAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgIGxldCBlbnRyeSA9IHRoaXMuX2tleW1hcC5nZXQoa2V5KTtcblxuICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgIC8vIHVwZGF0ZSBleGlzdGluZ1xuICAgICAgICBlbnRyeS52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9tYXJrRW50cnlBc1VzZWQoZW50cnkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgLy8gbmV3IGVudHJ5XG4gICAgICB0aGlzLl9rZXltYXAuc2V0KGtleSwgKGVudHJ5ID0gbmV3IEVudHJ5KGtleSwgdmFsdWUpKSk7XG5cbiAgICAgIGlmICh0aGlzLm5ld2VzdCkge1xuICAgICAgICAvLyBsaW5rIHByZXZpb3VzIHRhaWwgdG8gdGhlIG5ldyB0YWlsIChlbnRyeSlcbiAgICAgICAgdGhpcy5uZXdlc3RbTkVXRVJdID0gZW50cnk7XG4gICAgICAgIGVudHJ5W09MREVSXSA9IHRoaXMubmV3ZXN0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gd2UncmUgZmlyc3QgaW4gLS0geWF5XG4gICAgICAgIHRoaXMub2xkZXN0ID0gZW50cnk7XG4gICAgICB9XG5cbiAgICAgIC8vIGFkZCBuZXcgZW50cnkgdG8gdGhlIGVuZCBvZiB0aGUgbGlua2VkIGxpc3QgLS0gaXQncyBub3cgdGhlIGZyZXNoZXN0IGVudHJ5LlxuICAgICAgdGhpcy5uZXdlc3QgPSBlbnRyeTtcbiAgICAgICsrdGhpcy5zaXplO1xuICAgICAgaWYgKHRoaXMuc2l6ZSA+IHRoaXMubGltaXQpIHtcbiAgICAgICAgLy8gd2UgaGl0IHRoZSBsaW1pdCAtLSByZW1vdmUgdGhlIGhlYWRcbiAgICAgICAgdGhpcy5zaGlmdCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzaGlmdCgpIHtcbiAgICAgIC8vIHRvZG86IGhhbmRsZSBzcGVjaWFsIGNhc2Ugd2hlbiBsaW1pdCA9PSAxXG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMub2xkZXN0O1xuICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgIGlmICh0aGlzLm9sZGVzdFtORVdFUl0pIHtcbiAgICAgICAgICAvLyBhZHZhbmNlIHRoZSBsaXN0XG4gICAgICAgICAgdGhpcy5vbGRlc3QgPSB0aGlzLm9sZGVzdFtORVdFUl07XG4gICAgICAgICAgdGhpcy5vbGRlc3RbT0xERVJdID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHRoZSBjYWNoZSBpcyBleGhhdXN0ZWRcbiAgICAgICAgICB0aGlzLm9sZGVzdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB0aGlzLm5ld2VzdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZW1vdmUgbGFzdCBzdHJvbmcgcmVmZXJlbmNlIHRvIDxlbnRyeT4gYW5kIHJlbW92ZSBsaW5rcyBmcm9tIHRoZSBwdXJnZWRcbiAgICAgICAgLy8gZW50cnkgYmVpbmcgcmV0dXJuZWQ6XG4gICAgICAgIGVudHJ5W05FV0VSXSA9IGVudHJ5W09MREVSXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fa2V5bWFwLmRlbGV0ZShlbnRyeS5rZXkpO1xuICAgICAgICAtLXRoaXMuc2l6ZTtcbiAgICAgICAgcmV0dXJuIFtlbnRyeS5rZXksIGVudHJ5LnZhbHVlXTtcbiAgICAgIH1cbiAgICB9XG59Il19